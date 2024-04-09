import AuthModal from "@/components/Modal/Auth/AuthModal";
import { Flex } from "@chakra-ui/react";
import React from "react";
import AuthButtons from "./AuthButtons";
import Icons from "./Icons";
import LogOutButton from "./LogOutButton";
import UserMenu from "./UserMenu";

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
      </Flex>
    </>
  );
};
export default RightContent;
