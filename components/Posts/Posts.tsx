// components/Posts/Posts.tsx
import useCommunityData from "@/hooks/useCommunityData";
import { Post } from "@/atoms/postsAtom";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import PostLoader from "../Loaders/PostLoader";
import useCustomToast from "@/hooks/useCustomToast";
import { useAuth } from "@/hooks/useAuth";

type PostsProps = {
  communityId: string;
};

const Posts: React.FC<PostsProps> = ({ communityId }) => {
  const { user } = useAuth();
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

  const getPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/get?communityId=${communityId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get posts');
      }

      setPostStateValue((prev) => ({
        ...prev,
        posts: data.data
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

  useEffect(() => {
    if (communityId) {
      getPosts();
    }
  }, [communityId]);

  useEffect(() => {
    if (postStateValue.posts.length > 0) {
      const postIds = postStateValue.posts.map(post => post.id).join(',');
      if (user) {
        fetch(`/api/posts/getvote?postIds=${postIds}&userId=${user.id}`)
          .then(response => response.json())
          .then(data => {
            if (data.status === "error") throw new Error(data.message);
            setPostStateValue(prev => ({
              ...prev,
              postVotes: data.data
            }));
          }).catch(error => {
            showToast({
              title: "Could not fetch votes",
              description: error.message || "There was an error fetching votes",
              status: "error",
            });
          });
      }
    }
  }, [postStateValue.posts]);

  return (
    <>
      {loading ? (
        <PostLoader />
      ) : (
        <Stack spacing={3}>
          {postStateValue.posts.map((item) => (
            <PostItem
              key={item.id}
              post={item}
              userIsCreator={user?.id === item.owner_id}
              userVoteValue={postStateValue.postVotes.find((vote) => vote.postId === item.id)
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
  );
};
export default Posts;