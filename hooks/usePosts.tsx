// hooks/usePosts.tsx
import { authModalState } from "@/atoms/authModalAtom";
import { communityState } from "@/atoms/communitiesAtom";
import { Post, postState, PostVote } from "@/atoms/postsAtom";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import useCustomToast from "./useCustomToast";

const usePosts = () => {
  const isAuthenticated = true;
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;
  const setAuthModalState = useSetRecoilState(authModalState);
  const router = useRouter();
  const showToast = useCustomToast();

  const onVote = async (event: React.MouseEvent, post: Post, voteValue: number, communityId: string) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    const voteUrl = `/api/posts/vote/${post.id}`; // Assuming you might need to adjust this endpoint according to your backend URL setup for voting.
    try {
      const response = await fetch(voteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id, voteValue: voteValue, communityId: communityId }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      setPostStateValue(prev => ({
        ...prev,
        posts: prev.posts.map(p => p.id === post.id ? { ...p, voteStatus: data.voteStatus } : p),
        postVotes: data.newVotes, // Assuming your API returns the updated list of votes.
      }));
    } catch (error) {
      showToast({
        title: "Could not Vote",
        status: "error",
      });
    }
  };

  const onSelectPost = (post: Post) => {
    setPostStateValue(prev => ({
      ...prev,
      selectedPost: post,
    }));
    router.push(`/community/${post.communityId}/comments/${post.id}`);
  };

  const onDeletePost = async (post: Post) => {
    const deleteUrl = `api/posts/delete/${post.id}`;

    if (!isAuthenticated) {
      showToast({
        title: "Authentication Required",
        description: "You must be logged in to delete a post",
        status: "error",
      });
      return false;
    }

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
        },
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPostStateValue(prev => ({
        ...prev,
        posts: prev.posts.filter(p => p.id !== post.id),
      }));

      return true;
    } catch (error) {
      showToast({
        title: "Could not Delete Post",
        description: (error as Error).message,
        status: "error",
      });
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentCommunity?.id) {
      const fetchVotes = async () => {
        const votesUrl = `/api/posts/vote?communityId=${currentCommunity.id}`;
        const response = await fetch(votesUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const postVotes = await response.json();
          setPostStateValue(prev => ({
            ...prev,
            postVotes,
          }));
        }
      };

      fetchVotes();
    }
  }, [isAuthenticated, currentCommunity, setPostStateValue]);

  // Clear votes when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setPostStateValue(prev => ({
        ...prev,
        postVotes: [],
      }));
    }
  }, [isAuthenticated, setPostStateValue]);

  return { postStateValue, setPostStateValue, onSelectPost, onVote, onDeletePost };
};

export default usePosts;