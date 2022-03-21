import User from "../../../models/User";
import connectDb from ".././../../db/connectDatabase";

export default async function handler(req, res) {
  connectDb();
  const { method } = req;
  const { currentUserId, requestUserid } = req.query;

  // add friend
  if (method === "PATCH") {
    try {
      await User.findByIdAndUpdate(currentUserId, {
        $push: {
          friends: {
            friendId: requestUserid,
            send: true,
          },
        },
      });

      await User.findByIdAndUpdate(requestUserid, {
        $push: {
          friends: {
            friendId: currentUserId,
          },
        },
      });

      res.status(201).json({
        message: "Succefully Send Friend Request",
      });
    } catch (error) {
      console.log(error.message);
    }
  }
}
