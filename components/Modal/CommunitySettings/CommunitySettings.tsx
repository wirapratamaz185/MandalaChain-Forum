// compoenents/modal/communitySettings.tsx
import { Community, communityState } from "@/atoms/communitiesAtom";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { useRecoilState } from "recoil";

type CommunitySettingsModalProps = {
  open: boolean;
  handleClose: () => void;
  communityData: Community;
};

const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({
  open,
  handleClose,
  communityData,
}) => {
  const { onSelectFile } = useSelectFile(
    300,
    300
  );
  // debug data structure 
  const data: any = communityData;
  const correctData: Community = data.data;
  // console.log("Fix Data", correctData);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);
  const showToast = useCustomToast();

  /** 
   * Allows admin to change the image of the community. 
   */
  const onUpdateImage = async () => {
    if (!selectedFile) {
      // if no file is selected, do nothing 
      return;
    }
    setUploadingImage(true); // set uploading image to true 
    const formData = new FormData(); // create form data 
    formData.append("image", selectedFile); // append the selected file to the form data 
    formData.append("communityId", correctData.id); // append the community id to the form data 

    try {
      const response = await fetch("/api/community/logo", {
        method: "PATCH",
        body: formData,
      });
      const data = await response.json();
      console.log("Data Community Setting", data);
      // setCommunityStateValue(prevState => {
      //   return {
      //     ...prevState,
      //     currentCommunity: {
      //       ...prevState.currentCommunity,
      //       imageURL: correctData.imageURL,
      //       name: correctData.name,
      //       id: correctData.id as string,
      //       creatorId: correctData.owner_id ?? "",
      //       numberOfMembers: correctData.subscribers.length as number,
      //       privacyType: correctData.community_type.type as 'public' | 'private',
      //       createdAt: correctData.created_at as Date,
      //     }
      //   }
      // });
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToast({ title: "Failed to Update Image", description: errorMessage, status: "error" });
    } finally {
      setUploadingImage(false);
      setSelectedFile(null);
    }
  };

  /** 
   * Deletes the image of the community. 
   * @param {string} communityId - id of the community 
   */
  const onDeleteImage = async (communityId: string) => {
    try {
      const response = await fetch(`/api/community/logo?communityId=${communityData.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        // setCommunityStateValue(prevState => {
        //   return {
        //     ...prevState,
        //     currentCommunity: {
        //       ...prevState.currentCommunity,
        //       imageURL: correctData.imageURL,
        //       name: correctData.name,
        //       id: correctData.id as string,
        //       creatorId: correctData.owner_id ?? "", // Ensure owner_id is a string
        //       numberOfMembers: correctData.subscribers.length as number,
        //       privacyType: correctData.community_type.type as 'public' | 'private',
        //       createdAt: correctData.created_at as Date,
        //     }
        //   }
        // });
        showToast({ title: "Image Deleted Successfully", status: "success" });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToast({ title: "Failed to Update Image", description: errorMessage, status: "error" });
    }
  };

  const [selectedPrivacyType, setSelectedPrivacyType] = useState("");

  /** 
   * Changes the privacy type of the current community. 
   * @param {string} privacyType - privacy type to be changed to 
   */
  const onUpdateCommunityPrivacyType = async (is_private: boolean) => {
    try {
      const response = await fetch(`/api/community/settings?communityId=${correctData.id}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_private }),
      });
      const data = await response.json();
      if (response.ok) {
        showToast({ title: "Privacy Updated Successfully", status: "success" });
      } else {
        if (data.data === "You are not authorized to change the visibility of this community") {
          showToast({ title: "Authorization Error", description: data.data, status: "error" });
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToast({ title: "Failed to Update Community Type", description: errorMessage, status: "error" });
    }
  };

  /** 
   * Handles changes to the privacy type select input. 
   * @param {React.ChangeEvent<HTMLInputElement>} event - event when user selects a file 
   */
  const handlePrivacyTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPrivacyType(event.target.value); // set selected privacy type 
  };

  const handleSave = () => {
    if (selectedFile) {
      onUpdateImage();
    }
    if (!selectedFile && communityData.imageUrl) {
      onDeleteImage(communityData.id);
    }
    if (selectedPrivacyType && selectedPrivacyType !== (correctData.is_private ? 'private' : 'public')) {
      onUpdateCommunityPrivacyType(selectedPrivacyType === 'private');
    }
    handleClose();
  };

  /** 
   * Closes the modal and resets the state. 
   */
  const closeModal = () => {
    setSelectedFile(null);
    setSelectedPrivacyType("");
    setDeleteImage(false);
    handleClose();
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
            Community Settings
          </ModalHeader>
          <Box>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <>
                <Stack fontSize="10pt" spacing={2} p={5}>
                  {/* community image */}
                  <Flex align="center" justify="center" p={2}>
                    {correctData.imageUrl ||
                      selectedFile ? (
                      <Image
                        src={
                          selectedFile?.toString() ||
                          correctData.imageUrl
                        }
                        alt="Community Photo"
                        height="120px"
                        borderRadius="full"
                        shadow="md"
                      />
                    ) : (
                      <Icon
                        fontSize={120}
                        mr={1}
                        color="gray.300"
                        as={BsFillPeopleFill}
                      />
                    )}
                  </Flex>
                  <Flex align="center" justify="center">
                    <Text fontSize="14pt" fontWeight={600} color="gray.600">
                      {communityData.id}
                    </Text>
                  </Flex>

                  <Stack spacing={1} direction="row" flexGrow={1}>
                    <Button
                      flex={1}
                      height={34}
                      onClick={() => selectFileRef.current?.click()}
                    >
                      {correctData.imageUrl
                        ? "Change Image"
                        : "Add Image"}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/png,image/gif,image/jpeg"
                      hidden
                      ref={selectFileRef}
                      onChange={onSelectFile}
                    />
                    {correctData.imageUrl && (
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

                    {/*  */}
                  </Stack>
                  <Divider />
                  {/* Change community privacy type */}
                  <Flex direction="column">
                    <Stack spacing={2} direction="column" flexGrow={1}>
                      <Text fontWeight={600} fontSize="12pt" color="gray.500">
                        Community Type
                      </Text>
                      <Text fontWeight={500} fontSize="10pt" color="gray.500">
                        {`Currently ${correctData.is_private ? 'Private' : 'Public'}`}
                      </Text>

                      <Select
                        placeholder="Select option"
                        mt={2}
                        onChange={handlePrivacyTypeChange}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </Select>
                    </Stack>
                  </Flex>
                </Stack>
              </>
            </ModalBody>
          </Box>

          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Button
                width="100%"
                variant="outline"
                height="30px"
                mr={3}
                onClick={closeModal}
                flex={1}
              >
                Cancel
              </Button>
              <Button
                width="100%"
                height="30px"
                onClick={handleSave}
                flex={1}
              >
                Save
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CommunitySettingsModal;