// components/Community/About.tsx
import { Community } from "@/atoms/communitiesAtom";
import { Box, Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import CommunitySettingsModal from "../Modal/CommunitySettings/CommunitySettings";
import { useAuth } from "@/hooks/useAuth";

/**
 * @param {string} communityName - Name of the community
 */
type AboutProps = {
  communityData: Community;
};

/**
 * This about component is used for displaying general information about the community.
 * It displays the following data:
 *  - The number of subscribers in the community
 *  - Date when the community was created
 *  - Button for creating a new post
 *
 * Additional elements are displayed if the current user is an admin:
 *  - Button for opening the community settings modal
 * @param {communityData} - data requiblue to be displayed
 * @returns (React.FC<AboutProps>) - About component
 * @requires AboutHeaderBar - Header bar for the about section.
 * @requires AboutCommunity - Displays the number of subscribers and the date when the community was created.
 * @requires AdminSectionAbout - Displays some additional elements if the current user is an admin.
 */
const About: React.FC<AboutProps> = ({ communityData }) => {
  const router = useRouter();
  const data: any = communityData;
  const correctData: Community = data.data;
  // console.log(correctData);

  return (
    // sticky position for the about section
    <Box position="sticky" top="60px" borderRadius={10} shadow="md">
      <AboutHeaderBar communityName={correctData.name} />

      {/* about section */}
      <Flex
        direction="column"
        p={3}
        bg="white"
        borderRadius="0px 0px 10px 10px"
      >
        <Stack>
          <AboutCommunity communityData={communityData} />
          <Button
            width="100%"
            onClick={() => {
              router.push(`/community/${correctData.name}/submit`);
            }}
            _hover={{ bg: "blue.500", color: "white" }}
          >
            Create Post
          </Button>
          <AdminSectionAbout communityData={communityData} />
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;

/**
 * @param {string} communityName - Name of the community
 */
interface AboutHeaderBarProps {
  communityName: string;
}

/**
 * Header bar for the about section.
 * Contains the name of the community and a button for more options.
 * @param {string} communityName - Name of the community
 * @returns {React.FC<AboutHeaderBarProps>} - Header bar for the about section
 */
const AboutHeaderBar: React.FC<AboutHeaderBarProps> = ({ communityName }) => (
  <Flex
    justify="space-between"
    align="center"
    bg="blue.500"
    color="white"
    p={3}
    borderRadius="10px 10px 0px 0px"
  >
    <Text fontSize="10pt" fontWeight={700}>
      About {communityName}
    </Text>
    <Icon as={HiOutlineDotsHorizontal} />
  </Flex>
);

/**
 * @param {Community} communityData - data requiblue to be displayed
 */
interface AboutCommunityProps {
  communityData: Community;
}

/**
 * Displays the number of subscribers and the date when the community was created.
 * @param {Community} communityData - data requiblue to be displayed
 * @returns {React.FC<AboutCommunityProps>} - About community component
 */
const AboutCommunity: React.FC<AboutCommunityProps> = ({ communityData }) => {
  const data: any = communityData;
  const correctData: Community = data.data;
  // console.log(correctData);
  return (
    <>
      {/* {correctData.id} */}
      <Flex width="100%" p={2} fontSize="10pt">
        <Flex direction="column" flexGrow={1}>
          {/* number of subscribers and date created */}
          <Text fontWeight={700}>Subscribers</Text>
          <Text>{correctData.subscribers.length}</Text>
        </Flex>

        {/* when the community was created */}
        <Flex direction="column" flexGrow={1}>
          <Text fontWeight={700}>Created</Text>
          <Text>
            {correctData.created_at &&
              moment(new Date(correctData.created_at as any)).format(
                "MMM DD, YYYY"
              )}
          </Text>
        </Flex>
      </Flex>
    </>
  );
}

/**
 * @param {string} communityName - Name of the community
 */
type AdminSectionAboutProps = {
  communityData: Community;
};

/**
 * Displays some additional elements if the current user is an admin:
 *  - Button for opening the community settings modal
 * @returns {React.FC<AdminSectionAboutProps>} - Admin section component
 */
const AdminSectionAbout: React.FC<AdminSectionAboutProps> = ({
  communityData,
}) => {
  const [isCommunitySettingsModalOpen, setCommunitySettingsModalOpen] =
    useState(false);
  const { user } = useAuth();
  // const data: any = communityData;
  // const correctData: Community = data.data;
  return (
    <>
      {user?.id === communityData?.owner_id && (
        <>
          <CommunitySettingsModal
            open={isCommunitySettingsModalOpen}
            handleClose={() => setCommunitySettingsModalOpen(false)}
            communityData={communityData}
          />
          <Button
            width="100%"
            variant={"outline"}
            onClick={() => setCommunitySettingsModalOpen(true)}
            _hover={{ bg: "blue.500", color: "white" }}
          >
            Community Settings
          </Button>
        </>
      )}
    </>
  );
};