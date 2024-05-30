// components/Navbar/RightContent/AuthButtons.tsx
import { authModalState } from "@/atoms/authModalAtom";
import { Button } from "@chakra-ui/react";
import React from "react";
import { useSetRecoilState } from "recoil";

const AuthButtons: React.FC = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  return (
    <>
      <Button
        variant="outline"
        height="28px"
        display={{ base: "none", md: "flex" }}
        width={{ base: "70px", md: "110px" }}
        mr={2}
        ml={2}
        onClick={() => setAuthModalState({ open: true, view: "login" })}
        _hover={{ bg: "blue.500", color: "white" }}
      >
        Log In
      </Button>
      <Button
        variant="outline"
        height="28px"
        display={{ base: "none", md: "flex" }}
        width={{ base: "70px", md: "110px" }}
        mr={2}
        ml={2}
        onClick={() => setAuthModalState({ open: true, view: "signup" })}
        _hover={{ bg: "blue.500", color: "white" }}
      >
        Sign Up
      </Button>
    </>
  );
};
export default AuthButtons;