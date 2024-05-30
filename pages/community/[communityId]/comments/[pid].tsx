/* eslint-disable react-hooks/exhaustive-deps */
// pages/community/[communityId]/comments/[pid].tsx
import { Post } from "@/atoms/postsAtom";
import About from "@/components/Community/About";
import PageContent from "@/components/Layout/PageContent";
import PostLoader from "@/components/Loaders/PostLoader";
import Comments from "@/components/Posts/Comments/Comments";
import PostItem from "@/components/Posts/PostItem";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/utils/interface/auth";

const PostPage: React.FC = () => {
  const { postStateValue, setPostStateValue, onDeletePost, onVote, onBookmarkPost } =
    usePosts();
  const { communityStateValue } = useCommunityData();
  const { user } = useAuth();
  const router = useRouter();
  const showToast = useCustomToast();
  const [hasFetched, setHasFetched] = useState(false);
  const [postExists, setPostExists] = useState(true);
  const [postLoading, setPostLoading] = useState(false);

  const fetchPost = async (postId: string) => {
    setPostLoading(true);
    try {
      setHasFetched(false); // Reset fetching attempt status
      const response = await fetch(`/api/posts/getbyId?postId=${postId}`);
      const data = await response.json();

      if (response.ok) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: data.data,
        })); // Set post state
        setPostExists(true); // Set post existence to true
      } else {
        console.error("Error: fetchPost", data.message);
        showToast({
          title: "Could not Find Posts",
          description: data.message,
          status: "error",
        });
        // If post does not exist
        setPostExists(false); // Set post existence to false if post not found
      }
    } catch (error) {
      console.log("Error: fetchPost", error);
      showToast({
        title: "Could not Find Posts",
        description: "There was an error finding posts",
        status: "error",
      });
      setPostExists(false); // Set post existence to false on error
    } finally {
      setHasFetched(true); // Set fetching attempt status to true when finished
      setPostLoading(false);
    }
  };

  useEffect(() => {
    const { pid } = router.query;

    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }

    // If fetching attempt has been completed and post does not exist, redirect to `NotFound` page
    if (hasFetched && !postExists) {
      router.push("/404");
      return;
    }
  }, [postStateValue.selectedPost, router.query, hasFetched, postExists]);

  return (
    <PageContent>
      {/* Left */}
      <>
        {postLoading ? (
          <PostLoader />
        ) : (
          <>
            <Stack spacing={3} direction="column">
              {postStateValue.selectedPost && (
                <PostItem
                  post={postStateValue.selectedPost}
                  onVote={onVote}
                  onDeletePost={onDeletePost}
                  onBookmarkPost={onBookmarkPost}
                  userVoteValue={
                    postStateValue.postVotes.find(
                      (item) => item.postId === postStateValue.selectedPost?.id
                    )?.voteValue
                  }
                  userIsCreator={
                    user?.id === postStateValue.selectedPost?.owner_id
                  }
                  showCommunityImage={true}
                />
              )}

              <Comments
                user={user}
                selectedPost={postStateValue.selectedPost}
                communityId={postStateValue.selectedPost?.community_id as string}
              />
            </Stack>
          </>
        )}
      </>
      {communityStateValue.currentCommunity && (
        <About communityData={communityStateValue.currentCommunity} />
      )}
      {/* Right */}
      <></>
    </PageContent>
  );
};
export default PostPage;
