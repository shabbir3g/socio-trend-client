import axios from 'axios';
import Image from 'next/image';
import { BsX } from 'react-icons/bs';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ProfileModal = ({ data, isProfileModalOpen, closeProfileModal }) => {
  const user = useSelector((state) => state.states.user);
  const [displayName, setDisplayName] = useState('');
  const [preProfileImg, setPreProfileImg] = useState(null);
  const [preCoverImg, setPreCoverImg] = useState(null);

  const [profileImg, setProfileImg] = useState([]);
  const [coverImg, setCoverImg] = useState(null);

  const handleProfileImg = (file) => {
    setProfileImg(file);
    setPreProfileImg(URL.createObjectURL(file));
  };
  const handleCoverImg = (file) => {
    setCoverImg(file);
    setPreCoverImg(URL.createObjectURL(file));
  };
  let userData = {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (displayName) {
      userData.displayName = displayName;
    }
    const formData = new FormData();
    formData.append('upload_preset', 'my-uploads');

    if (profileImg) {
      formData.append('file', profileImg);
      await fetch(` https://api.cloudinary.com/v1_1/dtkl4ic8s/image/upload`, {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          userData.photoURL = data.url;
        });
    }

    if (coverImg) {
      formData.append('file', coverImg);
      await fetch(` https://api.cloudinary.com/v1_1/dtkl4ic8s/image/upload`, {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          userData.coverPicture = data.url;
        });
    }

    const response = await axios.put(
      `/api/user/updateProfile?email=${user.email}`,
      {
        userData,
      }
    );
    if (response.status === 200) {
      toast('Updated Success');
      closeProfileModal();
    }
  };

  return (
    <div
      className={`${
        isProfileModalOpen ? 'fixed' : 'hidden pointer-events-none'
      } bg-black bg-opacity-50 inset-0 justify-center items-center z-50 max-h-screen py-10`}
      // id="edit-profile-modal"
    >
      <div className="bg-gray-200 dark:bg-gray-800 max-w-xl mx-auto px-7 py-3 rounded shadow-xl text-gray-800">
        <div className="flex justify-between items-center border-b-2 py-3 border-gray-500">
          <h4 className="text-lg font-bold dark:text-white">Edit profile</h4>
          <button onClick={closeProfileModal}>
            <BsX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center pt-5">
            <h4 className="text-lg font-bold dark:text-white">
              Profile Picture
            </h4>
            <div>
              <label htmlFor="files1">
                <span className="text-lg text-blue-600 font-bold hover:bg-gray-300 px-3 py-1 rounded-md cursor-pointer">
                  Update
                </span>
              </label>
              <input
                type="file"
                name="file"
                id="files1"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleProfileImg(e.target.files[0])}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              className="object-cover rounded-full border-2 bg-no-repeat"
              src={
                preProfileImg ||
                data.photoURL ||
                'https://i.ibb.co/5kdWHNN/user-12.png'
              }
              alt="profile image"
              width="120"
              height="120"
            />
          </div>
          <div className="flex justify-between items-center py-5">
            <h4 className="text-lg font-bold dark:text-white">Cover Photo</h4>
            <label htmlFor="files2">
              <span className="text-lg text-blue-600 font-bold hover:bg-gray-300 px-3 py-1 rounded-md cursor-pointer ">
                Update
              </span>
            </label>
            <input
              type="file"
              name="file"
              id="files2"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCoverImg(e.target.files[0])}
            />
          </div>

          <div className="flex justify-center">
            <Image
              className="object-content"
              src={
                preCoverImg ||
                data.coverPicture ||
                'https://i.ibb.co/pWc2Ffd/u-bg.jpg'
              }
              alt="profile image"
              width="500"
              height="200"
            />
          </div>
          <div className="flex items-center space-x-3 py-6">
            <div className="text-lg font-bold dark:text-white">
              Chenge Your Name:
            </div>
            <input
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={data.displayName}
              defaultValue={data.displayName}
              className="w-2/4 h-10 px-2 focus:outline-none dark:bg-gray-700 dark:text-white"
              type="text"
              name="name"
              id="name"
            />
          </div>
          <div className="mt-3 flex justify-end space-x-3 pb-5">
            <button className="px-3 py-1 bg-green-500 text-gray-200 hover:bg-green-700 rounded-md">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
