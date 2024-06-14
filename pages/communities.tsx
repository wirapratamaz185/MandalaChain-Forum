// pages/communities.tsx
import { useEffect, useState } from "react";
import { Community } from "@/atoms/communitiesAtom";
import CommunityItem from "@/components/Community/CommunityItem";
import PersonalHome from "@/components/Community/PersonalHome";
import PageContent from "@/components/Layout/PageContent";
import CommunityLoader from "@/components/Loaders/CommunityLoader";
import useCommunityData from '../hooks/useCommunityData';
import useCustomToast from "@/hooks/useCustomToast";
import { Button, Flex, Stack } from "@chakra-ui/react";

const Communities: React.FC = () => {
  const { onJoinOrLeaveCommunity } = useCommunityData();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [subscribedCommunities, setSubscribedCommunities] = useState<{ communityId: string }[]>([]);

  const showToast = useCustomToast();

  const getCommunities = async (numberOfExtraPosts: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/get?order=desc&limit=${5 + numberOfExtraPosts}`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.statusText}`);
      }
      const data = await response.json();
      setCommunities(data.data.communities || []);  // Ensure this path is correct based on response structure
    } catch (error) {
      console.error('Fetching communities failed:', error);
      showToast({
        title: "Please log in to see the community",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCommunities(0);
  }, []);

  useEffect(() => {
    const fetchSubscribedCommunities = async () => {
      try {
        const response = await fetch("/api/community/getsubscribe");
        const data = await response.json();
        if (data.status) { // Check for the correct status field
          setSubscribedCommunities(data.data);
          // console.log("Fetched subscribed communities:", data.data);
        } else {
          console.error("Failed to fetch subscribed communities:", data.message);
        }
      } catch (error) {
        console.error("Error fetching subscribed communities:", error);
      }
    };

    fetchSubscribedCommunities();
  }, []);

  return (
    <>
      <PageContent>
        <Stack direction="column" borderRadius={10} spacing={3}>
          {loading ? (
            <Stack mt={2} p={3}>
              {Array(5).fill(0).map((_, index) => (
                <CommunityLoader key={index} />
              ))}
            </Stack>
          ) : (
            communities.map((community, index) => {
              const isJoined = subscribedCommunities.some(
                (sub) => sub.communityId === community.id
              );
              return (
                <CommunityItem
                  key={index}
                  community={community}
                  isJoined={isJoined}
                  onJoinOrLeaveCommunity={async () => {
                    await onJoinOrLeaveCommunity(community.id, isJoined);
                    setSubscribedCommunities((prev) =>
                      isJoined
                        ? prev.filter((sub) => sub.communityId !== community.id)
                        : [...prev, { communityId: community.id }]
                    );
                  }}
                />
              );
            })
          )}
          <Flex p="10px 20px" alignContent="center" justifyContent="center">
            <Button
              height="34px"
              width="200px"
              onClick={() => getCommunities(10)}
              shadow="md"
              isLoading={loading}
              _hover={{ bg: "blue.500", color: "white" }}
            >
              View More
            </Button>
          </Flex>
        </Stack>
        <PersonalHome />
      </PageContent>
    </>
  );
};

export default Communities;