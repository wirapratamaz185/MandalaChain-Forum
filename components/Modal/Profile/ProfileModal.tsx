// components/modal/profile/ProfileModal.tsx
import { useRef, useState, useEffect } from 'react';
import useCustomToast from '@/hooks/useCustomToast';
import useSelectFile from '@/hooks/useSelectFile';
import { useAuth } from '@/hooks/useAuth';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Image,
  Flex,
  Box,
} from '@chakra-ui/react';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const { selectedFile, onSelectFile } = useSelectFile(300, 300);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const showToast = useCustomToast();
  const [userName, setUserName] = useState(user?.username || '');
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');

  useEffect(() => {
    setToken(localStorage.getItem('cookie') || '');
    if (!isOpen) {
      setUserName(user?.username || '');
      setImageUrl(user?.imageUrl || '');
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!token) {
      showToast({
        title: 'Authentication Error',
        description: 'You must be logged in to update your profile',
        status: 'error',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', userName);
      if (selectedFile) formData.append('image', selectedFile);

      const response = await fetch('/api/profile/modify', {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        showToast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated',
          status: 'success',
        });
        onClose();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      showToast({
        title: 'Update Failed',
        description: `Error: ${(error as Error).message}`,
        status: 'error',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex direction="column" align="center" mb={4}>
            <Image
              borderRadius="full"
              boxSize="100px"
              src={imageUrl || '/fallback-image.png'}
              alt="Profile Image"
            />
            <Button mt={4} onClick={() => selectFileRef.current?.click()}>
              Change Profile Image
            </Button>
            <Input
              type="file"
              ref={selectFileRef}
              onChange={onSelectFile}
              hidden
            />
          </Flex>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileModal;