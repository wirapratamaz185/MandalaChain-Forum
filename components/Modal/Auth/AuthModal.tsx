import { useState, useEffect } from 'react';
import {
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import AuthInputs from "./AuthInput";
import OAuthButtons from "./OAuthButtons";
import ResetPassword from "./ResetPassword";

const AuthModal: React.FC = () => {
  const [authMode, setAuthMode] = useState('login');

  const handleClose = () => {
    setAuthMode('');
  };

  const switchMode = (mode: string) => {
    setAuthMode(mode);
  };

  return (
    <Modal isOpen={authMode !== ''} onClose={handleClose}>
      <ModalOverlay
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="auto"
        backdropBlur="5px"
      />
      <ModalContent borderRadius={10}>
        <ModalHeader textAlign="center">
          {authMode === "signup" && "Sign Up"}
          {authMode === "login" && "Login"}
        </ModalHeader>
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
            {authMode === "login" && (
              <>
                <OAuthButtons />
                <Divider />
                <AuthInputs />
              </>
            )}
            {authMode === "signup" && (
              <>
                <AuthInputs />
              </>
            )}
            {authMode === "resetPassword" && (
              <ResetPassword />
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;