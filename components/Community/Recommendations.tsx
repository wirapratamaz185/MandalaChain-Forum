// components/community/Recommendations.tsx
import { Community } from "@/atoms/communitiesAtom";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Flex,
  Icon,
  Link,
  Skeleton,
  SkeletonCircle,
  Stack,
  Image,
  Text,
  Box,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";

const Recommendations: React.FC = () => {
  return (
    <Flex
      direction="column"
      position="relative"
      bg="white"
      borderRadius={10}
      border="1px solid"
      borderColor="gray.300"
      shadow="md"
    >
      <SuggestionsHeader />

      <Flex direction="column" mb={2}>
        <SuggestedCommunitiesList />
      </Flex>
    </Flex>
  );
};
export default Recommendations;

const SuggestionsHeader: React.FC = () => {
  return (
    <Flex
      align="flex-end"
      color="white"
      p="6px 10px"
      height="70px"
      borderRadius="10px 10px 0px 0px"
      fontWeight={700}
      backgroundSize="cover"
      bgColor={"blue.500"}
    >
      Top Communities
    </Flex>
  );
};

/**
 * Displays the top 5 communities with the most members.
 * @returns {React.FC} - Suggested communities list component
 */
const SuggestedCommunitiesList: React.FC = () => {
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();
  // console.log("Community State Value:", communityStateValue)
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const showToast = useCustomToast();
  const router = useRouter();
  /**
   * Gets the top 5 communities with the most members.
   */
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/community/get?limit=5", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not fetch communities.");
        setCommunities(data.data.communities);
      } catch (error) {
        const errMessage = (error as Error).message;
        // showToast({
        //   title: 'Please log in to view this community',
        //   status: "error"
        // });
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  // console.log("My Snippets:", communityStateValue.mySnippets);

  return (
    <Flex direction="column" mb={0}>
      {loading ? (
        <Stack mt={2} p={3}>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Flex justify="space-between" align="center" key={index}>
                <SkeletonCircle size="10" />
                <Skeleton height="10px" width="70%" />
              </Flex>
            ))}
        </Stack>
      ) : (
        <>
          {communities.map((item, index) => {
            const isJoined = !!communityStateValue.mySnippets.find(
              (snippet: { communityId: string; }) => snippet.communityId === item.id
            );
            // console.log(`Community: ${item.name}, isJoined: ${isJoined}`);
            return (
              <Link key={item.id} href={`/community/${item.id}`}>
                <Flex
                  key={item.id}
                  align="center"
                  fontSize="10pt"
                  borderBottom="1px solid"
                  borderColor="gray.300"
                  p="10px 12px"
                >
                  <Flex width="80%" align="center">
                    <Flex width="15%">
                      <Text>{index + 1}</Text>
                    </Flex>
                    <Flex align="center" width="80%">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          borderRadius="full"
                          boxSize="28px"
                          mr={2}
                          alt="Community Icon"
                        />
                      ) : (
                        <Icon
                          as={IoPeopleCircleOutline}
                          fontSize={34}
                          color="blue.500"
                          mr={1}
                        />
                      )}
                      {/* show dots when community name doesnt fit */}
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {`${item.name}`}
                      </span>
                    </Flex>
                  </Flex>
                  <Box position="absolute" right="10px">
                    <Button
                      height="24px"
                      width="100px"
                      fontSize="8pt"
                      variant={isJoined ? "outline" : "solid"}
                      onClick={(event) => {
                        event.preventDefault();
                        onJoinOrLeaveCommunity(item.id, isJoined);
                      }}
                    >
                      {isJoined ? "Unsubscribe" : "Subscribe"}
                    </Button>
                  </Box>
                </Flex>
              </Link>
            );
          })}
        </>
      )}
      <Box p="10px 20px">
        <Button
          height="30px"
          width="100%"
          onClick={() => {
            router.push(`/communities`);
          }}
          _hover={{ bg: "blue.500", color: "white" }}
        >
          View All
        </Button>
      </Box>
    </Flex>
  );
};