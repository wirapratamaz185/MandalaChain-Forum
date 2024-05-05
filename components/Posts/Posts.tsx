// components/Posts/Posts.tsx
import { Community } from "@/atoms/communitiesAtom";
import { Post } from "@/atoms/postsAtom";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import PostLoader from "../Loaders/PostLoader";
import useCustomToast from "@/hooks/useCustomToast";
import { useAuth } from "@/hooks/useAuth";

type PostsProps = {
  communityData: Community;
};


const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onDeletePost,
    onSelectPost,
  } = usePosts();
  const showToast = useCustomToast();

  // check utlitity function to get all posts in the community
  const isValidCommunityId = () => communityData && communityData.id;

  /**
   * Gets all posts in the community.
   *
   * @returns {Promise<void>} - void
   */
  const getPosts = async () => {
    if (!isValidCommunityId()) {
      console.error("Posts Component Error: Community ID not available");
      return; // Early exit if id is not available
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/get?communityId=${communityData.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setPostStateValue((prev) => ({
        ...prev,
        posts: result.posts,
      }));
    } catch (error: any) {
      console.error("Error: getPosts", error.message);
      showToast({
        title: "Posts not Loaded",
        description: "There was an error loading posts",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Gets all votes in the community when component mounts (page loads).
   */
  useEffect(() => {
    if (isValidCommunityId()) {
      getPosts();
    }
  }, [communityData.id]);

  return (
    <>
      {/* If loading is true, display the post loader component */}
      {loading ? (
        <PostLoader />
      ) : (
        // If the posts are available, display the post item components
        <Stack spacing={3}>
          {/* For each post (item) iterebly create a post car component */}
          {postStateValue.posts.map((item) => (
            <PostItem
              key={item.id}
              post={item}
              userIsCreator={user?.id === item.creatorId}
              userVoteValue={
                postStateValue.postVotes.find((vote) => vote.postId === item.id)?.voteValue
              }
              onVote={(e) => onVote(e, item, item.voteStatus, communityData.id)}
              onSelectPost={onSelectPost}
              onDeletePost={onDeletePost}
            />
          ))}
        </Stack>
      )}
    </>
  );
};
export default Posts;
