// pages/index.tsx
import { Post, PostVote } from "@/atoms/postsAtom";
// import CreatePostLink from "@/components/Community/CreatePostLink";
import PersonalHome from "@/components/Community/PersonalHome";
import Recommendations from "@/components/Community/Recommendations";
import PageContent from "@/components/Layout/PageContent";
import PostLoader from "@/components/Loaders/PostLoader";
import PostItem from "@/components/Posts/PostItem";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import usePosts from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { communityStateValue } = useCommunityData();
  const {
    setPostStateValue,
    postStateValue,
    onSelectPost,
    onVote,
    onDeletePost,
    onBookmarkPost,
  } = usePosts();
  const showToast = useCustomToast();

  // Function to fetch posts from API
  const fetchPosts = async (endpoint: string) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }

      // console.log("Received data: ", data.data)
      setPostStateValue((prev) => ({
        ...prev,
        posts: data.data
      }));
    } catch (error) {
      // showToast({
      //   title: "Could not load posts",
      //   description: (error as Error).message,
      //   status: "error",
      // });
    } finally {
      setLoading(false);
    }
  };

  /**
 * Creates a home feed for a currently logged in user.
 * If the user is a member of any communities, it will display posts from those communities.
 * If the user is not a member of any communities, it will display generic posts.
 */
  const buildUserHomeFeed = async () => {
    const endpoint = user ? `/api/posts/homefeed?userId=${user.id}` : '/api/posts/generic';
    await fetchPosts(endpoint);
    console.log("User home feed built");
  };

  useEffect(() => {
    buildUserHomeFeed();
  }, [user]);

  /**
   * Fetches votes for the posts currently in the home feed.
   */
  const getUserPostVotes = async () => {
    if (!user || !postStateValue.posts.length) return;
    try {
      const postId = postStateValue.posts.map((post) => post.id)
      const response = await fetch(`/api/posts/getvote?postIds=${postId.join(',')}&userId=${user.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch votes');
      }
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: data.data
      }));
    } catch (error) {
      showToast({
        title: "Could not fetch votes",
        description: "There was an error fetching votes",
        status: "error",
      });
    }
  }

  // Load posts when the component mounts or when the community changes
  useEffect(() => {
    if (communityStateValue.currentCommunity) {
      fetchPosts(communityStateValue.currentCommunity.id);
    }
  }, [communityStateValue.currentCommunity]);


  // Load user votes when the posts are loaded
  // useEffect(() => {
  //   if (postStateValue.posts.length) getUserPostVotes();
  // }, []);
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

  // Replace the onVote prop with handleVote
  return (
    <PageContent>
      <>
        {/* <CreatePostLink /> */}
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
                onBookmarkPost={onBookmarkPost}
                onVote={onVote}
                userVoteValue={postStateValue.postVotes?.find(
                  (item) => item.postId === post.id
                )?.voteValue} userIsCreator={false}
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