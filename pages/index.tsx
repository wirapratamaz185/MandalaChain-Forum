
import { Post, PostVote } from "@/atoms/postsAtom";
import CreatePostLink from "@/components/Community/CreatePostLink";
import PersonalHome from "@/components/Community/PersonalHome";
import Recommendations from "@/components/Community/Recommendations";
import PageContent from "@/components/Layout/PageContent";
import PostLoader from "@/components/Loaders/PostLoader";
import PostItem from "@/components/Posts/PostItem";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(false);
  const { communityStateValue } = useCommunityData();
  const {
    setPostStateValue,
    postStateValue,
    onSelectPost,
    onVote,
    onDeletePost,
  } = usePosts();
  const showToast = useCustomToast();

  // Function to fetch posts from API
  const fetchPosts = async (communityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/get?communityId=${communityId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.message);
      }
      setPostStateValue((prev) => ({
        ...prev,
        posts: data.data as Post[],
      }));
    } catch (error) {
      showToast({
        title: "Could not load posts",
        description: (error as Error).message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle voting on a post
  // Adjust the handleVote function to match the expected signature
  const handleVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    // Assuming you need the postId and voteValue from the post and vote parameters
    const postId = post.id;
    const voteValue = vote;

    try {
      const response = await fetch(`/api/posts/vote?id=${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: voteValue }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.message);
      }
      // Update the local state with the new vote count
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, vote: data.data.vote } : p
        ),
      }));
    } catch (error) {
      showToast({
        title: "Could not vote on post",
        description: (error as Error).message,
        status: "error",
      });
    }
  };

  // Load posts when the component mounts or when the community changes
  useEffect(() => {
    if (communityStateValue.currentCommunity) {
      fetchPosts(communityStateValue.currentCommunity.id);
    }
  }, [communityStateValue.currentCommunity]);

  // Replace the onVote prop with handleVote
  return (
    <PageContent>
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack spacing={3}>
            {postStateValue.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={handleVote}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (item) => item.postId === post.id
                  )?.voteValue
                }
                userIsCreator={user?.id === post.user.id}
              />
            ))}
          </Stack>
        )}
      </>
      <Stack spacing={2}>
        <Recommendations />
        <PersonalHome />
      </Stack>
    </PageContent>
  );
}