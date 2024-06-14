import { Community } from "@/atoms/communitiesAtom";
import { Button, Flex, Icon, Image, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoPeopleCircleOutline } from "react-icons/io5";

interface CommunityItemProps {
  community: Community;
  isJoined: boolean;
  onJoinOrLeaveCommunity: (community: Community, isJoined: boolean) => void;
}

const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  isJoined,
  onJoinOrLeaveCommunity,
}) => {
  const router = useRouter();

  return (
    <Flex
      align="center"
      fontSize="10pt"
      borderColor="white"
      borderWidth="1px"
      p="14px 12px"
      borderRadius={10}
      bg="white"
      _hover={{
        borderColor: "gray.400",
        boxShadow: "xl",
      }}
      cursor="pointer"
      onClick={() => {
        router.push(`/community/${community.id}`);
      }}
      shadow="md"
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        flexGrow={1}
        align="left"
      >
        <CommunityItemNameIconSection community={community} />
        <CommunityItemButtonMembersSection
          community={community}
          onJoinOrLeaveCommunity={onJoinOrLeaveCommunity}
          isJoined={isJoined}
        />
      </Stack>
    </Flex>
  );
};

export default CommunityItem;

/**
 * @param {Community} community - community object
 */
type CommunityItemNameIconSectionProps = {
  community: Community;
};
const CommunityItemNameIconSection = ({
  community,
}: CommunityItemNameIconSectionProps) => {
  return (
    <Flex align="center" width="100%">
      <Flex align="center" direction="row">
        {community.imageUrl ? (
          <Image
            src={community.imageUrl}
            borderRadius="full"
            boxSize="35px"
            mr={4}
            alt="Community Icon"
          />
        ) : (
          <Icon
            as={IoPeopleCircleOutline}
            fontSize={38}
            color="blue.500"
            mr={4}
          />
        )}
        <Text fontSize={16}>{community.name}</Text>
      </Flex>
    </Flex>
  );
};

type CommunityItemButtonMembersSectionProps = {
  community: Community;
  onJoinOrLeaveCommunity: (community: Community, isJoined: boolean) => void;
  isJoined: boolean;
};

const CommunityItemButtonMembersSection = ({
  community,
  onJoinOrLeaveCommunity,
  isJoined,
}: CommunityItemButtonMembersSectionProps) => {
  return (
    <Stack direction="row" align="center" justifyContent="space-between">
      <Flex
        fontSize={18}
        color="gray.500"
        justify="center"
        align="center"
        mr={2}
      >
        <Icon as={BsFillPeopleFill} mr={1} />
        {community.subscribers.length}
      </Flex>
      <Button
        height="30px"
        width="130px"
        fontSize="10pt"
        variant={isJoined ? "outline" : "solid"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation(); // stop the event from bubbling up
          onJoinOrLeaveCommunity(community, isJoined);
        }}
      >
        {isJoined ? "Unsubscribe" : "Subscribe"}
      </Button>
    </Stack>
  );
};
