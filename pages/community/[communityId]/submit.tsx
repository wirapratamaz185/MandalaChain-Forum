// pages/community/[communityId]/submit.tsx
import { authModalState } from "@/atoms/authModalAtom";
import About from "@/components/Community/About";
import PageContent from "@/components/Layout/PageContent";
import AuthButtons from "@/components/Navbar/RightContent/AuthButtons";
import NewPostForm from "@/components/Posts/NewPostForm";
import useCommunityData from "@/hooks/useCommunityData";
import { Box, Stack, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { User } from "@/utils/interface/auth";

const SubmitPostPage: React.FC = () => {
  const { communityStateValue, getCommunityData } = useCommunityData();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { communityId } = router.query;
  console.log("communityId want to post", communityId);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
          setUser({ ...parsedUser });
        } catch (error) {
          console.log("Error Parsing Token", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (communityId) {
      getCommunityData(communityId as string);
    }
  }, [communityId]);

  return (
    <PageContent>
      <>
        <Box p="14px 0px">
          <Text fontSize="20pt" fontWeight={700} color="black">
            Create Post
          </Text>
        </Box>
        {user ? (
          <NewPostForm
            user={user}
            communityId={communityId as string}
            communityImageURL={communityStateValue.currentCommunity?.imageUrl}
            currentCommunity={communityStateValue.currentCommunity}
          />
        ) : (
          <Stack
            justifyContent="center"
            align="center"
            bg="white"
            p={5}
            borderRadius={10}
          >
            <Text fontWeight={600}>Log in or sign up to post</Text>
            <Stack direction="row" spacing={2} ml={4}>
              <AuthButtons />
            </Stack>
          </Stack>
        )}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};
export default SubmitPostPage;