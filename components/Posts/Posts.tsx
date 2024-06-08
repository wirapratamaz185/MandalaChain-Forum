// components/Posts/Posts.tsx
import useCommunityData from "@/hooks/useCommunityData";
import { Post } from "@/atoms/postsAtom";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import PostLoader from "../Loaders/PostLoader";
import useCustomToast from "@/hooks/useCustomToast";
// import { useAuth } from "@/hooks/useAuth";
import { User } from "@/utils/interface/auth";

type PostsProps = {
  communityId: string;
};

const Posts: React.FC<PostsProps> = ({ communityId }) => {
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

  const getPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/get?communityId=${communityId}`);
      const data = await response.json();
      console.log("Data: ", data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get posts');
      }

      // setPostStateValue((prev) => ({
      //   ...prev,
      //   posts: data.data.posts
      // }));

      // console.log("Posts: ", postStateValue.posts)
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
    fetchUserFromStorage();
  }, []);

  useEffect(() => {
    if (communityId) {
      getPosts();
    }
  }, [communityId]);

  // useEffect(() => {
  //   if (postStateValue.posts.length > 0) {
  //     const postIds = postStateValue.posts.map(post => post.id).join(',');
  //     if (user) {
  //       fetch(`/api/posts/getvote?postIds=${postIds}`)
  //         .then(response => response.json())
  //         .then(data => {
  //           if (data.status === "error") throw new Error(data.message);
  //           setPostStateValue(prev => ({
  //             ...prev,
  //             postVotes: data.data
  //           }));
  //         }).catch(error => {
  //           showToast({
  //             title: "Could not fetch votes",
  //             description: error.message || "There was an error fetching votes",
  //             status: "error",
  //           });
  //         });
  //     }
  //   }
  //   console.log("post value state", postStateValue.posts)
  // }, [postStateValue.posts]);

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
  );
};

export default Posts;