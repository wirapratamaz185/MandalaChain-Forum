// components/modal/profile/ProfileModal.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useCustomToast from '@/hooks/useCustomToast';
import useSelectFile from '@/hooks/useSelectFile';

type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

  const { selectedFile, onSelectFile } = useSelectFile(300, 300);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const showToast = useCustomToast();
  const [userName, setUserName] = useState(user?.name || '');
  const [imageUrl, setImageUrl] = useState(user?.image || ''); // Assuming user image URL is stored in user.image

  // Close modal and reset form
  const closeModal = () => {
    setUserName(user?.name || '');
    setImageUrl(user?.image || '');
    handleClose();
  };

  const handleSaveButton = async () => {
    // API call to save the profile
    if (!token) {
      showToast({
        title: 'Authentication Error',
        description: 'You must be logged in to update your profile',
        status: 'error',
      });
      return;
    }

    // Return null if `open` is false to avoid rendering the modal.
  if (!open) {
    return null;
  }

    try {
      const formData = new FormData();
      formData.append('username', userName);
      if (selectedFile) formData.append('image', selectedFile);

      const response = await fetch('/api/profile/modify', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      showToast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
      });
      closeModal();
    } catch (error) {
      console.error('Error updating profile: ', error);
      showToast({
        title: 'Profile update failed',
        description: 'There was an error updating your profile',
        status: 'error',
      });
    }
  };

  useEffect(() => {
    if (!open) {
      // Reset form data when modal is closed
      setUserName(user?.name || '');
      setImageUrl(user?.image || '');
    }
  }, [open, user]);

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-5 max-w-md w-full">
          <div className="text-center font-semibold text-xl">Profile</div>
          <div className="my-5">
            {/* Profile Image */}
            <div className="text-center">
              <img
                src={imageUrl || ''}
                alt="Profile"
                className="inline-block h-24 w-24 rounded-full"
              />
            </div>

            {/* Name Input */}
            <div className="mt-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* File Input */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => selectFileRef.current?.click()}
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Choose Image
              </button>
              <input type="file" ref={selectFileRef} onChange={onSelectFile} hidden />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleClose}
              className="py-2 px-4 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveButton}
              className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
};

export default ProfileModal;