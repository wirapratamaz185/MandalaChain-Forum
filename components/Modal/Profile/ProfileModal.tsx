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
import React, { useRef, useState, useEffect } from "react";
import { MdAccountCircle } from "react-icons/md";

type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(300, 300);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);
  const showToast = useCustomToast();
  const [user, setUser] = useState<{ email: string; username: string; imageUrl?: string } | null>(null);
  const [userName, setUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message);
        }

        setUser(result.data);
        setUserName(result.data.username);
        // console.log("User data fetched:", result.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Debugging: Log the user data
  useEffect(() => {
    // console.log("User data:", user);
  }, [user]);

  /**
   * Closes the modal and resets the states.
   */
  const closeModal = () => {
    setSelectedFile("");
    setDeleteImage(false);
    setIsEditing(false);
    handleClose();
  };

  const onUpdateImage = async () => {
    if (!(user && selectedFile)) {
      return;
    }
    try {
      setUploadingImage(true);
      const formData = new FormData();
      console.log("Selected file:", selectedFile);
      formData.append("file", selectedFile);

      const response = await fetch(`/api/profile/modify`, {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }
      setUser((prevUser) => prevUser ? { ...prevUser, imageUrl: result.data.imageUrl } : null);
      console.log("Profile image updated:", result.data.imageUrl); // Add logging
      showToast({
        title: "Profile updated",
        description: "Your profile image has been updated",
        status: "success",
      });
    } catch (error) {
      console.error("Error: onUpdateImage: ", error);
      showToast({
        title: "Image not Updated",
        description: "Failed to update profile image",
        status: "error",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onDeleteImage = async () => {
    try {
      if (!user) {
        return;
      }
      const response = await fetch(`/api/profile/delete`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }
      setUser((prevUser) => prevUser ? { ...prevUser, imageUrl: undefined } : null);
      showToast({
        title: "Profile updated",
        description: "Your profile image has been deleted",
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

  const onUpdateUserName = async () => {
    try {
      const response = await fetch(`/api/profile/updateName`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userName,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }
      setUser((prevUser) => prevUser ? { ...prevUser, username: userName } : null);
      showToast({
        title: "Profile updated",
        description: "Your profile name has been updated",
        status: "success",
      });
    } catch (error) {
      console.error("Error: onUpdateUserName: ", error);
      showToast({
        title: "Name not Updated",
        description: "Failed to update profile name",
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

  const handleSaveButtonClick = () => {
    if (selectedFile) {
      onUpdateImage();
    }
    if (deleteImage) {
      onDeleteImage();
    }
    if (userName && userName !== user?.username) {
      onUpdateUserName();
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
                    {user?.username}
                  </Text>
                </Stack>

                {isEditing && (
                  <Stack spacing={1} direction="row" flexGrow={1}>
                    <Button
                      flex={1}
                      height={34}
                      onClick={() => selectFileRef.current?.click()}
                      _hover={{ bg: "blue.500", color: "white" }}
                    >
                      {user?.imageUrl ? "Change Image" : "Add Image"}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/png,image/gif,image/jpeg"
                      hidden
                      ref={selectFileRef}
                      onChange={onSelectFile}
                    />
                    {user?.imageUrl && (
                      <Button
                        flex={1}
                        height={34}
                        variant="outline"
                        onClick={() => setDeleteImage(true)}
                        isDisabled={deleteImage}
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
                      <Text fontSize="12pt">{user?.username}</Text>
                    </Flex>
                  </Flex>
                )}
                {isEditing && (
                  <Flex direction="column">
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      User Name
                    </Text>
                    <Input
                      name="displayName"
                      placeholder="User Name"
                      value={userName}
                      type="text"
                      onChange={handleNameChange}
                      _hover={{
                        bg: "white",
                        border: "1px solid",
                        borderColor: "red.500",
                      }}
                      _focus={{
                        bg: "white",
                        border: "1px solid",
                        borderColor: "red.500",
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
                _hover={{ bg: "blue.500", color: "white" }}
              >
                Cancel
              </Button>
              {isEditing ? (
                <Button
                  height="30px"
                  width="100%"
                  onClick={handleSaveButtonClick}
                  _hover={{ bg: "blue.500", color: "white" }}
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
                  _hover={{ bg: "blue.500", color: "white" }}
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