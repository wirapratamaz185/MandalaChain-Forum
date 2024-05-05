// components/Navbar/RightContent/RightContent.tsx
import AuthModal from "@/components/Modal/Auth/AuthModal";
import { Flex } from "@chakra-ui/react";
import React from "react";
import AuthButtons from "./AuthButtons";
import Icons from "./Icons";
import LogOutButton from "./LogOutButton";
import UserMenu from "./UserMenu";
import { User } from "@/utils/interface/auth";

type RightContentProps = {
  user?: User | null;
};

const RightContent: React.FC<RightContentProps> = ({ user }) => {
  return (
    <>
      <AuthModal />
      <Flex justify="center" align="center">
        {/* If user is logged in, icons are shown
        If user is not logged in, authentication buttons are shown */}
        {user ? <Icons /> : <AuthButtons />}
        <UserMenu user={user} />
        <LogOutButton />
      </Flex>
    </>
  );
};
export default RightContent;
