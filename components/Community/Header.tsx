// components/community/header.tsx
import { Community } from "@/atoms/communitiesAtom";
import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import useCommunityData from "@/hooks/useCommunityData";
import { useRouter } from "next/router";
import { FiSettings } from "react-icons/fi";
import IconItem from "../atoms/Icon";
import CommunitySettingsModal from "../Modal/CommunitySettings/CommunitySettings";
import { useAuth } from '@/hooks/useAuth';
import { HiArrowCircleUp } from "react-icons/hi";

/**
 * @param {communityData} - data requiblue to be displayed
 */
type HeaderProps = {
  communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {
  const { communityStateValue, joinCommunity, leaveCommunity, loading } =
    useCommunityData();

  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id
  );

  const { user } = useAuth();
  const router = useRouter();

  // debug data structure
  const data: any = communityData;
  const correctData: Community = data.data;
  // console.log("Debug data", correctData);

  const onJoinOrLeaveCommunity = async () => {
    if (isJoined) {
      await leaveCommunity(correctData.id);
    } else {
      await joinCommunity(correctData.id);
    }
  }

  return (
    <Flex direction="column" width="100%" height="120px">
      <Box height="30%" bg="blue.500" />
      <Flex justify="center" bg="white" flexGrow={1}>
        <Flex width="95%" maxWidth="1200px" align="center">
          {/* using state instead of fetching from db as no refresh of the page is requiblue */}
          <CommunityIcon
            imageURL={correctData.imageURL}
          />
          <Flex padding="10px 16px" width="100%">
            <CommunityName name={correctData.name}/>
            <Flex direction="row" flexGrow={1} align="end" justify="end">
              <CommunitySettings communityData={communityData} />
              <JoinOrLeaveButton
                isJoined={isJoined}
                onClick={() => onJoinOrLeaveCommunity()}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Header;

/**
 * @param {string} imageURL - URL of the community icon
 */
type CommunityIconProps = {
  imageURL?: string;
};

const CommunityIcon = ({ imageURL }: CommunityIconProps) => {
  return imageURL ? (
    // if the community icon is available, then display the community icon
    <Image
      src={imageURL}
      borderRadius="full"
      boxSize="66px"
      alt="Community icons"
      color="red.500"
      border="3px solid white"
      shadow="md"
    />
  ) : (
    // if the community icon is not available, then display a default icon
    <Icon
      as={HiArrowCircleUp}
      fontSize={64}
      color="blue.500"
      border="3px solid white"
      borderRadius="full"
      bg="white"
      shadow="md"
    />
  );
};

/**
 * @param {string} id - id of the community
 */
type CommunityNameProps = {
  name: string;
};

const CommunityName: React.FC<CommunityNameProps> = ({ name }) => {
  return (
    <Flex direction="column" mr={6}>
      <Text fontWeight={600} fontSize="16pt">
        {name}
      </Text>
    </Flex>
  );
};

/**
 * @param {boolean} isJoined - true if the user is already subscribed to the community
 */
type JoinOrLeaveButtonProps = {
  isJoined: boolean;
  onClick: () => void;
};

export const JoinOrLeaveButton: React.FC<JoinOrLeaveButtonProps> = ({
  isJoined,
  onClick,
}) => {
  return (
    <Button
      variant={isJoined ? "outline" : "solid"}
      height="30px"
      pr={{ base: 2, md: 6 }}
      pl={{ base: 2, md: 6 }}
      onClick={onClick}
      shadow="md"
      width="120px"
    >
      {isJoined ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

type CommunitySettingsProps = {
  communityData: Community;
};

export const CommunitySettings: React.FC<CommunitySettingsProps> = ({
  communityData,
}) => {
  const router = useRouter();
  const { communityId } = router.query;
  const { user } = useAuth();
  const [isCommunitySettingsModalOpen, setCommunitySettingsModalOpen] =
    useState(false);

  // debug data structure
  // const data: any = communityData;
  // const correctData: Community = data.data;
  // console.log("Debug data", correctData);

  return (
    <>
      {user?.id === communityData.owner_id && (
        <>
          <CommunitySettingsModal
            open={isCommunitySettingsModalOpen}
            handleClose={() => setCommunitySettingsModalOpen(false)}
            communityData={communityData}
          />
          <IconItem
            icon={FiSettings}
            fontSize={20}
            onClick={() => setCommunitySettingsModalOpen(true)}
            iconColor="gray.500"
          />
        </>
      )}
    </>
  );
};
