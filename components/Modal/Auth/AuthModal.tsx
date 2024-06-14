// components/Modal/Auth/AuthModal.tsx
import { useRecoilState } from 'recoil';
import { authModalState } from '../../../atoms/authModalAtom';
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
  const [modalState, setModalState] = useRecoilState(authModalState);

  const handleClose = () => {
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <Modal isOpen={modalState.open} onClose={handleClose}>
      <ModalOverlay
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="auto"
        backdropBlur="5px"
      />
      <ModalContent borderRadius={10}>
        <ModalHeader textAlign="center">
          {modalState.view === "signup" && "Sign Up"}
          {modalState.view === "login" && "Log In"}
          {modalState.view === "resetPassword" && "Reset Password"}
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
            width="110%"
          >
            {modalState.view === "login" && (
              <>
                <OAuthButtons />
                <Divider />
                <AuthInputs />
              </>
            )}
            {modalState.view === "signup" && (
              <>
                <AuthInputs />
              </>
            )}
            {modalState.view === "resetPassword" && (
              <ResetPassword />
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;