import { Box, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import { IoPeopleCircleOutline } from "react-icons/io5";
import CustomMenuButton from "@/components/atoms/CustomMenuButton";
import CreateCommunityModal from "@/components/Modal/CreateCommunity/CreateCommunityModal";
import useDirectory from "@/hooks/useDirectory";
import MenuListItem from "./MenuListItem";

type CommunitySnippet = {
  communityId: string;
  communityName: string;
};

type CommunitiesProps = {};

const Communities: React.FC<CommunitiesProps> = () => {
  // console.log("Communities component rendered"); // Log to ensure component is rendered

  const [open, setOpen] = useState(false); // modal initially closed
  const [subscribedCommunities, setSubscribedCommunities] = useState<CommunitySnippet[]>([]);
  const router = useRouter();
  const { toggleMenuOpen } = useDirectory();

  useEffect(() => {
    const fetchSubscribedCommunities = async () => {
      try {
        const response = await fetch("/api/community/getsubscribe");
        const data = await response.json();
        if (data.status) { // Check for the correct status field
          setSubscribedCommunities(data.data); // Adjust based on your API response structure
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
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />

      <CustomMenuButton
        icon={<GrAdd />}
        text="Create Community"
        onClick={() => {
          setOpen(true);
          toggleMenuOpen();
        }}
      />

      <CustomMenuButton
        icon={<BsFillPeopleFill />}
        text="View All Communities"
        onClick={() => {
          router.push("/communities");
          toggleMenuOpen();
        }}
      />

      <Box>
        <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
          SUBSCRIBED COMMUNITIES
        </Text>
        {subscribedCommunities.length > 0 ? (
          subscribedCommunities.map((snippet) => {
            // Debugging: Log each snippet
            // console.log("Subscribed snippet:", snippet);
            return (
              <MenuListItem
                key={snippet.communityId}
                icon={IoPeopleCircleOutline}
                displayText={snippet.communityName} // Display community name
                link={`/community/${snippet.communityId}`}
                iconColor={"red.500"}
              />
            );
          })
        ) : (
          <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
            No subscribed communities found.
          </Text>
        )}
      </Box>
    </>
  );
};

export default Communities;