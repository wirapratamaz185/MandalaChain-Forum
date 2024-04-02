import { Community } from "@/atoms/communitiesAtom";
import CommunityItem from "@/components/Community/CommunityItem";
import PersonalHome from "@/components/Community/PersonalHome";
import PageContent from "@/components/Layout/PageContent";
import CommunityLoader from "@/components/Loaders/CommunityLoader";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import { Button, Flex, Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

/**
 * Displays the communities page with the top 5 communities.
 * Pressing the "See More" button will display the next 5 communities.
 * @returns {React.FC} - the communities page with the top 5 communities.
 */
const Communities: React.FC = () => {
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const router = useRouter();
  const showToast = useCustomToast();

  /**
   * Gets the top 5 communities with the most members.
   * @param {number} numberOfExtraPosts - number of extra posts to display
   */
  const getCommunities = async (numberOfExtraPosts: number) => {
    setLoading(true);
    // rwrite with prisma posgresql
    try {
      const numberOfExtraPosts = 5;
      const response = await fetch(`/api/community/get?order=desc&limit=${5 + numberOfExtraPosts}`, {
        method: "GET",
      });
      const data = await response.json();
      console.log("data", data);
      setCommunities(data.communities as Community[]);
    } catch (error) {
      console.log("Error: getCommunityRecommendations", error);
      showToast({
        title: "Could not Find Communities",
        description: "There was an error getting communities",
        status: "error",
      });
    } finally {
      setLoading(false);
    }



    // try {
    //   const communityQuery = query(
    //     collection(firestore, "communities"),
    //     orderBy("numberOfMembers", "desc"),
    //     limit(5 + numberOfExtraPosts)
    //   );
    
  };

  useEffect(() => {
    getCommunities(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageContent>
        <>
          <Stack direction="column" borderRadius={10} spacing={3}>
            {loading ? (
              <Stack mt={2} p={3}>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <CommunityLoader key={index} />
                  ))}
              </Stack>
            ) : (
              <>
                {communities.map((community, index) => {
                  const isJoined = !!communityStateValue.mySnippets.find(
                    (snippet) => snippet.communityId === community.id
                  );
                  return (
                    <CommunityItem
                      key={index}
                      community={community}
                      isJoined={isJoined}
                      onJoinOrLeaveCommunity={onJoinOrLeaveCommunity}
                    />
                  );
                })}
              </>
            )}
            <Flex p="10px 20px" alignContent="center" justifyContent="center">
              <Button
                height="34px"
                width="200px"
                onClick={() => {
                  getCommunities(5);
                }}
                shadow="md"
                isLoading={loading}
              >
                View More
              </Button>
            </Flex>
          </Stack>
        </>
        <Stack spacing={2}>
          <PersonalHome />
        </Stack>
        <></>
      </PageContent>
    </>
  );
};
export default Communities;
