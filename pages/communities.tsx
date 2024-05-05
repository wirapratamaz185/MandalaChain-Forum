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
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();
  console.log('communityStateValue:', communityStateValue); // Debugging line

  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);

  const showToast = useCustomToast();

  const getCommunities = async (numberOfExtraPosts: number) => {
    console.log('getCommunities called with:', numberOfExtraPosts); // Debugging line
    setLoading(true);
    try {
      const response = await fetch(`/api/community/get?order=desc&limit=${5 + numberOfExtraPosts}`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched communities:", data); // Debugging line
      setCommunities(data.data.communities || []);  // Ensure this path is correct based on response structure
    } catch (error) {
      console.error('Fetching communities failed:', error);
      showToast({
        title: "Could not find communities",
        description: (error as Error).message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log('useEffect called'); // Debugging line
    getCommunities(0);
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
              const isJoined = !!communityStateValue.mySnippets.find(
                snippet => snippet.communityId === community.id
              );
              console.log('Rendering community:', community, 'isJoined:', isJoined);
              return (
                <CommunityItem
                  key={index}
                  community={community}
                  isJoined={isJoined}
                  onJoinOrLeaveCommunity={() => onJoinOrLeaveCommunity(community.id, isJoined)}
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