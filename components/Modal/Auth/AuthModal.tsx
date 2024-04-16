import { authModalState } from "@/atoms/authModalAtom";
import {
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  Text,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { useSession } from 'next-auth/react';
import OAuthButtons from "./OAuthButtons";

const AuthModal: React.FC = () => {
  const [modalState, setModalState] = useRecoilState(authModalState);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) handleClose();
  }, [session]);

  const handleClose = () => {
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const getTitle = () => {
    switch (modalState.view) {
      case 'login':
        return 'Log In';
      case 'signup':
        return 'Sign Up';
      case 'resetPassword':
        return 'Reset Password';
      default:
        return '';
    }
  };

  return (
    <>
      <Modal isOpen={modalState.open} onClose={handleClose}>
        <ModalOverlay
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="auto"
          backdropBlur="5px"
        />
        <ModalContent borderRadius={10}>
          <ModalHeader>{getTitle()}</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            pb={6}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              width="75%"
            >
              {modalState.view === "login" || modalState.view === "signup" ? (
                <>
                  <OAuthButtons />
                  <Divider my={4} />
                  {/* Here you would include your AuthInputs component for login/signup forms */}
                </>
              ) : null}
              {/* Here you would include your ResetPassword component if modalState.view === 'resetPassword' */}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModal;