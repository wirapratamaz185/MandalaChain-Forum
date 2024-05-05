// components/Navbar/Navbar.tsx:
import { defaultMenuItem } from "@/atoms/directoryMenuAtom";
import useDirectory from "@/hooks/useDirectory";
import { Flex, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Directory from "./Directory/Directory";
import RightContent from "./RightContent/RightContent";
// import SearchInput from "./SearchInput";

const Navbar: React.FC = () => {
  const { onSelectMenuItem } = useDirectory();
  const { user } = useAuth();

  return (
    <Flex
      bg="white"
      height="50px"
      padding="6px 10px"
      justify={{ md: "space-between" }}
      position="sticky"
      top="4px"
      zIndex="999"
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
        <Image src="/images/mandalachain.jpeg" height="30px" alt="" ml={1} />
        <Text ml={2}>Mandala Chain</Text>
      </Flex>
      {user && <Directory />}
      {/* <SearchInput /> */}
      <RightContent user={user} />
    </Flex>
  );
};

export default Navbar;