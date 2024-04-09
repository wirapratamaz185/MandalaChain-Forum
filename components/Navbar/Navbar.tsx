import { defaultMenuItem } from "@/atoms/directoryMenuAtom";
import useDirectory from "@/hooks/useDirectory";
import { Flex, Image, Text } from "@chakra-ui/react";
import React from "react";
import Directory from "./Directory/Directory";
import RightContent from "./RightContent/RightContent";
import SearchInput from "./SearchInput";

/**
 * @returns {React.FC} - Navbar component
 *
 * @requires ./RightContent - content displaying authentication buttons or actions
 * @requires ./SearchInput - Search field
 * @requires ./Directory - showing community menu button
 */
const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth); // will be passed to child components
  const { onSelectMenuItem } = useDirectory();

  return (
    <Flex
      bg="white"
      height="50px"
      padding="6px 10px"
      justify={{ md: "space-between" }}
      position="sticky"
      top="4px"
      zIndex="999"
      // Rounded props
      border="1px solid"
      borderColor="gray.300"
      borderRadius={10}
      m={{ base: 1, md: 1.5 }}
      shadow="lg"
    >
      <Flex
        align="center"
        width={{ base: "40px", md: "auto" }}
        mr={{ base: 0, md: 2 }}
        onClick={() => onSelectMenuItem(defaultMenuItem)}
        cursor="pointer"
      >
        {/* Logo which is always visible */}
        <Image src="/images/mandalachain.jpeg" height="30px" alt="" ml={1} />
        {/* Text next to the logo */}
        <Text ml={2}>Mandala Chain</Text>
      </Flex>
      {/* Community directory only visible when user is logged in */}
      {user && <Directory />}
      <SearchInput />
      {/* Changes depending on whether user is authenticated or not */}
      <RightContent user={user} />
    </Flex>
  );
};
export default Navbar;
