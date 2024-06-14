import { authModalState } from "@/atoms/authModalAtom";
import CustomMenuButton from "@/components/atoms/CustomMenuButton";
import ProfileModal from "@/components/Modal/Profile/ProfileModal";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { MdAccountCircle, MdOutlineLogin } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";
import { useSetRecoilState } from "recoil";

/**
 * @param {User | null} user - user currently logged in if any
 */
type UserMenuProps = {
  user?: { email: string; imageUrl?: string } | null;
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; imageUrl?: string } | null>(null);
  const [imageProfile, setImageProfile] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFromStorage = () => {
      const userCookie = localStorage.getItem("access_token");

      if (userCookie) {
        try {
          const base64Url = userCookie.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          const parsedUser = JSON.parse(jsonPayload);
          setCurrentUser({ email: parsedUser.email, imageUrl: parsedUser.imageUrl });
        } catch (error) {
          console.log("Error Parsing Token", error);
        }
      }
    };

    fetchUserFromStorage();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message);
        }

        setImageProfile(result.data.imageUrl);
        setUsername(result.data.username);
        // console.log("User data fetched:", result.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Toggles the menu open and closed.
   */
  const toggle = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
    }
  };

  return (
    <>
      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setProfileModalOpen(false)}
      />

      <Menu isOpen={isMenuOpen} onOpen={toggle} onClose={toggle}>
        <UserMenuButton user={currentUser} isMenuOpen={isMenuOpen} imageProfile={imageProfile} username={username} />
        <UserMenuList user={currentUser} setProfileModalOpen={setProfileModalOpen} setCurrentUser={setCurrentUser} />
      </Menu>
    </>
  );
};
export default UserMenu;

/**
 * @param {User | null | undefined} user - user currently logged in if any
 * @param {boolean} isMenuOpen - whether the menu is open or not
 * @param {string | null} imageProfile - profile image URL
 */
interface UserMenuButtonProps {
  user: { email: string; imageUrl?: string } | null | undefined;
  isMenuOpen: boolean;
  imageProfile: string | null;
  username: string | null;
}

const UserMenuButton: React.FC<UserMenuButtonProps> = ({
  user,
  isMenuOpen,
  imageProfile,
  username,
}) => (
  <MenuButton
    cursor="pointer"
    height="100%"
    padding="0px 6px"
    borderRadius={10}
    _hover={{
      outline: "1px solid",
      outlineColor: "gray.200",
    }}
    maxWidth="150px"
  >
    <Flex align="center">
      {user ? (
        // If user is authenticated, display user icon and name
        <>
          {imageProfile ? (
            <>
              <Image
                src={imageProfile}
                alt="User Profile Photo"
                height="30px"
                borderRadius="full"
                mr={1}
              />
            </>
          ) : (
            <Icon
              fontSize={30}
              mr={1}
              color="gray.300"
              as={MdAccountCircle}
            />
          )}

          <Flex
            direction="column"
            display={{ base: "none", lg: "flex" }}
            fontSize="8pt"
            align="flex-start"
            mr={2}
          >
            <Text fontWeight={700} fontSize={10}>
              {username}
            </Text>
          </Flex>
        </>
      ) : (
        // If user is unauthenticated, display generic user icon
        <Icon fontSize={24} color="gray.400" mr={1} as={VscAccount} />
      )}
      {isMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
    </Flex>
  </MenuButton>
);

/**
 * @param {User} user - current user
 */
interface UserMenuListProps {
  user: { email: string; imageUrl?: string } | null | undefined;
  setProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<{ email: string; imageUrl?: string } | null>>;
  //todo pass open profile modal function
}

const UserMenuList: React.FC<UserMenuListProps> = ({
  user,
  setProfileModalOpen,
  setCurrentUser,
}) => {
  const setAuthModalState = useSetRecoilState(authModalState);

  const handleLogout = async () => {
    try {
      const response = await fetch(`/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (response.ok) {
        // Clear local storage
        localStorage.removeItem("access_token");
        // Clear the user state
        setCurrentUser(null);
        console.log(result.message);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MenuList borderRadius={10} mt={2} shadow="lg">
      <Flex justifyContent="center">
        <Stack spacing={1} width="95%">
          {user ? (
            <>
              <CustomMenuButton
                icon={<CgProfile />}
                text="Profile"
                onClick={() => setProfileModalOpen(true)}
              />

              <CustomMenuButton
                icon={<MdOutlineLogin />}
                text="Log Out"
                onClick={handleLogout}
              />
            </>
          ) : (
            <>
              <CustomMenuButton
                icon={<MdOutlineLogin />}
                text="Log In / Sign Up"
                onClick={() => setAuthModalState({ open: true, view: "login" })}
              />
            </>
          )}
        </Stack>
      </Flex>
    </MenuList>
  );
};