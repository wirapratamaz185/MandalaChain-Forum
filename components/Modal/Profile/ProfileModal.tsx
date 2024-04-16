// components/modal/profile/ProfileModal.tsx
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { MdAccountCircle } from "react-icons/md";
import { useSession } from "next-auth/react";
import { access } from "fs";

type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage

  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(300, 300);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const showToast = useCustomToast();
  const [userName, setUserName] = useState(user?.name || "");
  const [imageUrl, setImageUrl] = useState(user?.image || ""); // Assuming user image URL is stored in user.image
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Closes the modal and resets the states.
  const closeModal = () => {
    setSelectedFile("");
    setUserName(user?.name || "");
    setImageUrl(user?.image || "");
    setIsEditing(false);
    handleClose();
  };

  /**
   * Update profile image of the currently logged in user.
   * Exists if the user is not logged in or no image is selected.
   */
  // const onUpdateImage = async () => {
  //   if (!(user && selectedFile)) {
  //     return;
  //   }
  //   try {
  //     setUploadingImage(true);

  //     const imageRef = ref(storage, `users/${user?.uid}/profileImage`); // path to store image
  //     await uploadString(imageRef, selectedFile, "data_url"); // upload image
  //     const downloadURL = await getDownloadURL(imageRef); // get image url

  //     const success = await updateProfile({
  //       photoURL: downloadURL,
  //     }); // update profile image url in firestore
  //     if (!success) {
  //       throw new Error("Failed to update profile image");
  //     }

  //     showToast({
  //       title: "Profile updated",
  //       description: "Your profile has been updated",
  //       status: "success",
  //     });
  //   } catch (error) {
  //     console.error("Error: onUpdateImage: ", error);
  //     showToast({
  //       title: "Image not Updated",
  //       description: "Failed to update profile image",
  //       status: "error",
  //     });
  //   } finally {
  //     setUploadingImage(false);
  //   }
  // };

  /**
   * Deletes the profile image of the currently logged in user.
   * Exists if the user is not logged in.
   */
  const onDeleteImage = async () => {
    try {
      // if (!user) {
      //   return;
      // }
      // const imageRef = ref(storage, `users/${user?.uid}/profileImage`); // path to store image
      // await deleteObject(imageRef); // delete image
      // const success = await updateProfile({
      //   photoURL: "",
      // }); // update profile image url in firestore
      // if (!success) {
      //   throw new Error("Failed to delete profile image");
      // }

      showToast({
        title: "Profile updated",
        description: "Your profile has been updated",
        status: "success",
      });
    } catch (error) {
      console.error("Error: onDeleteImage: ", error);
      showToast({
        title: "Image not Deleted",
        description: "Failed to delete profile image",
        status: "error",
      });
    }
  };

  // Update profile name and image of the currently logged in user.
  const onUpdateProfile = async () => {
    if (!token) {
      showToast({
        title: "Authentication Error",
        description: "You must be logged in to update your profile",
        status: "error",
      });
      return;
    }

    try {
      const response = await fetch('/api/profile/modify', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`, // Include the JWT token in the Authorization header
        },
        body: JSON.stringify({
          username: userName,
          imageUrl: imageUrl, // Send the imageUrl as part of the request body
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      showToast({
        title: "Profile updated",
        description: "Your profile has been updated",
        status: "success",
      });

      // Optionally, refresh user data here if you are using a global state or SWR
      // For example, if using SWR:
      // mutate('/api/user'); // Revalidate the user data
      closeModal(); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating profile: ", error);
      showToast({
        title: "Profile not updated",
        description: "Failed to update profile",
        status: "error",
      });
    }
  };


  /**
   * Updates the state which tracks the name of the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event - event of the input field
   */
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  /**
   * Saves the changes made to the profile.
   * If the profile image is changed, it is updated.
   * If the profile image is deleted, it is deleted.
   * If the profile name is changed, it is updated.
   * Closes the modal after saving.
   */
  const handleSaveButtonClick = () => {
    if (selectedFile) {
      onUpdateImage();
    }
    if (onDeleteImage) {
      onDeleteImage();
    }
    if (userName && userName !== user?.name) {
      onUpdateProfile();
    }
    closeModal();
  };

  return (
    <>
      <Modal isOpen={open} onClose={handleClose}>
        <ModalOverlay
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="auto"
          backdropBlur="5px"
        />
        <ModalContent borderRadius={10}>
          <ModalHeader
            display="flex"
            flexDirection="column"
            padding={3}
            textAlign="center"
          >
            Profile
          </ModalHeader>
          <Box>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <Stack p={5} spacing={5}>
                {/* image */}
                <Stack direction="column" align="center" justify="center" p={2}>
                  {user?.imageUrl || selectedFile ? (
                    <Image
                      src={selectedFile || (user?.imageUrl as string)}
                      alt="User Photo"
                      height="120px"
                      borderRadius="full"
                      shadow="md"
                    />
                  ) : (
                    <Icon
                      fontSize={120}
                      mr={1}
                      color="gray.300"
                      as={MdAccountCircle}
                    />
                  )}
                  <Text fontSize="xl" color="gray.700">
                    {user?.name}
                  </Text>
                </Stack>

                {isEditing && (
                  <Stack spacing={1} direction="row" flexGrow={1}>
                    <Button
                      flex={1}
                      height={34}
                      onClick={() => selectFileRef.current?.click()}
                    >
                      {user?.photoURL ? "Change Image" : "Add Image"}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/png,image/gif,image/jpeg"
                      hidden
                      ref={selectFileRef}
                      onChange={onSelectFile}
                    />
                    {user?.photoURL && (
                      <Button
                        flex={1}
                        height={34}
                        variant="outline"
                        onClick={() => onDeleteImage(true)}
                        isDisabled={onDeleteImage}
                      >
                        Delete Image
                      </Button>
                    )}
                  </Stack>
                )}
                {/*  */}

                {/* name */}
                {!isEditing && (
                  <Flex direction="column">
                    <Flex direction="row">
                      <Text
                        fontSize="12pt"
                        color="gray.600"
                        mr={1}
                        fontWeight={600}
                      >
                        Email:
                      </Text>
                      <Text fontSize="12pt">{user?.email}</Text>
                    </Flex>
                    <Flex direction="row">
                      <Text
                        fontSize="12pt"
                        color="gray.600"
                        mr={1}
                        fontWeight={600}
                      >
                        User Name:
                      </Text>
                      <Text fontSize="12pt">{user?.name || ""}</Text>
                    </Flex>
                  </Flex>
                )}
                {isEditing && (
                  <Flex direction="column">
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      User Name
                    </Text>
                    <Input
                      name="name"
                      placeholder="User Name"
                      value={userName}
                      type="text"
                      onChange={handleNameChange}
                      _hover={{
                        bg: "white",
                        border: "1px solid",
                        borderColor: "blue.500",
                      }}
                      _focus={{
                        bg: "white",
                        border: "1px solid",
                        borderColor: "blue.500",
                      }}
                      borderRadius={10}
                    />
                  </Flex>
                )}
                {/*  */}
              </Stack>
            </ModalBody>
          </Box>
          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Button
                variant="outline"
                height="30px"
                width="100%"
                onClick={closeModal}
              >
                Cancel
              </Button>
              {isEditing ? (
                <Button
                  height="30px"
                  width="100%"
                  onClick={handleSaveButtonClick}
                >
                  Save
                </Button>
              ) : (
                <Button
                  height="30px"
                  width="100%"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ProfileModal;

function onUpdateImage() {
  throw new Error("Function not implemented.");
}
