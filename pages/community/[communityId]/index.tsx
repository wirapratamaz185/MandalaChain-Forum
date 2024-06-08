// pages/community/[communityId]/index.tsx
import { Community, communityState } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
// import CreatePostLink from "@/components/Community/CreatePostLink";
import Header from "@/components/Community/Header";
import NotFound from "@/components/Community/NotFound";
import PageContent from "@/components/Layout/PageContent";
import PostItem from "@/components/Posts/PostItem";
import PostLoader from "@/components/Loaders/PostLoader";
import { GetServerSidePropsContext } from "next";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";
import { getCookie } from "cookies-next";
import { Stack } from "@chakra-ui/react";
import useCommunityData from "@/hooks/useCommunityData";
import usePosts from "@/hooks/usePosts";
import useCustomToast from "@/hooks/useCustomToast";
import { User } from "@/utils/interface/auth";

/**
 * @param {Community} communityData - Community data for the current community
 */
type CommunityPageProps = {
  communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const data: any = communityData;
  const correctData: Community = data.data;
  // console.log("Community Data in CommunityPage:", correctData);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { communityStateValue } = useCommunityData();
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onDeletePost,
    onSelectPost,
    onBookmarkPost,
  } = usePosts();
  const showToast = useCustomToast();

  // console.log("postStateValue looks like:", postStateValue.posts);

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
        setUser({ id: parsedUser.id, email: parsedUser.email, username: parsedUser.username });
      } catch (error) {
        console.log("Error Parsing Token", error);
      }
    }
  };

  useEffect(() => {
    fetchUserFromStorage();
  }, []);

  useEffect(() => {
    if (correctData.posts) {
      setPostStateValue((prev) => ({
        ...prev,
        posts: correctData.posts,
      }));
    }
  }, [correctData.posts]);

  if (!communityData || Object.keys(communityData).length === 0) {
    return <NotFound />;
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          {/* <CreatePostLink /> */}
          {loading ? (
            <PostLoader />
          ) : (
            <Stack spacing={3}>
              {postStateValue.posts.map((item) => (
                <PostItem
                  key={item.id}
                  post={item}
                  userIsCreator={user?.id === item.user_id}
                  userVoteValue={postStateValue.postVotes?.find((vote) => vote.postId === item.id)
                    ?.voteValue}
                  onVote={onVote}
                  onSelectPost={onSelectPost}
                  onDeletePost={onDeletePost} 
                  onBookmarkPost={onBookmarkPost}
                />
              ))}
            </Stack>
          )}
        </>
        <About communityData={communityData} />
      </PageContent>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { communityId } = context.query;
  console.log("Community ID in getServerSideProps:", communityId);

  if (!communityId) {
    console.error("Community ID is not provided.");
    return { props: { communityData: {} } };
  }

  const token = getCookie("access_token", { req: context.req });

  if (!token) {
    console.error("No access token found in cookies.");
    return { props: { communityData: {} } };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `access_token=${token}`,
  };

  try {
    const url = `http://localhost:3000/api/community/getdetail?communityId=${communityId}`;
    const response = await fetch(url, { method: "GET", headers });
    console.log("API response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch data, received status ${response.status}`);
    }

    const data = await response.json();
    // console.log("Community Data:", data.data);
    return {
      props: { communityData: JSON.parse(safeJsonStringify(data)) },
    };
  } catch (error) {
    console.error("Error in fetching community details:", (error as any).message);
    return { props: { communityData: {} } };
  }
}

export default CommunityPage;