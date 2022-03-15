import styles from "../styles/messenger.module.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Conversation from "../components/Messenger/Conversation";
import Message from "../components/Messenger/Message";
import OnlineUsers from "../components/Messenger/OnlineUsers";
import AllUsers from "../components/Messenger/AllUsers";
import { useSelector } from "react-redux";
import Navigation from "../components/Share/Navigation";

export default function Messenger() {
  const user = useSelector((state) => state.states.user);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [dbUser, setDbUser] = useState({});
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socket = useRef();

  useEffect(() => {
    // socket.current = io("ws://localhost:8900");
    socket.current = io("https://dry-oasis-76334.herokuapp.com/");

    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", dbUser._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        allUsers.filter((f) => users.some((u) => u.userId === f._id))
      );
    });
  }, [allUsers, dbUser._id]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/messenger/getConversations?userId=${dbUser._id}`
        );
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [dbUser._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/messenger/messages?conversationId=${currentChat?._id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/user?email=${user?.email}`)
      .then(({ data }) => setDbUser(data));
  }, [user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: dbUser._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== dbUser._id
    );

    socket.current.emit("sendMessage", {
      senderId: dbUser._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post(
        "http://localhost:3000/api/messenger/messages",
        message
      );
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/user/allUsers").then(({ data }) => {
      setAllUsers(data);
    });
  }, []);

  return (
    <>
      <Navigation />
      <div className={styles.messenger}>
        <div className={styles.chatMenu}>
          <div className="p-2.5 h-full">
            <input
              placeholder="Search for friends"
              className="w-11/12 py-2.5 px-0 border-0"
            />
            {conversations?.map((c) => (
              <div onClick={() => setCurrentChat(c)} key={c._id}>
                <Conversation conversation={c} currentUser={dbUser} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.chatBox}>
          <div className="flex flex-col justify-between relative p-2.5 h-full">
            {currentChat ? (
              <>
                <div className="h-full overflow-y-scroll pr-2.5">
                  {messages.map((m) => (
                    <div ref={scrollRef} key={m._id}>
                      <Message message={m} own={m.sender === dbUser._id} />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <textarea
                    className="w-10/12 h-24 p-2.5"
                    placeholder="write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button
                    className="w-24 h-10 border-none rounded-md cursor-pointer bg-teal-700 text-white"
                    onClick={handleSubmit}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="absolute mt-2.5 text-5xl text-slate-200 cursor-default">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
        <div className={styles.chatOnline}>
          <div className="">
            <h2>Online Users</h2>
          </div>
          <div className="p-2.5 h-full">
            {onlineUsers.map((user) => (
              <OnlineUsers
                key={user._id}
                user={user}
                currentId={dbUser._id}
                setCurrentChat={setCurrentChat}
              />
            ))}
            <div className="">
              <h2>All Users</h2>
              {allUsers.map((user) => (
                <AllUsers
                  key={user._id}
                  user={user}
                  currentId={dbUser._id}
                  setCurrentChat={setCurrentChat}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
