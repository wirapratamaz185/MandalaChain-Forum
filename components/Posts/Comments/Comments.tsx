/* eslint-disable react-hooks/exhaustive-deps */
// components/Posts/Comments/Comments.tsx
import { Post, postState } from "@/atoms/postsAtom";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Box,
  Divider,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import CommentInput from "./CommentInput";
import CommentItem, { Comment } from "./CommentItem";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/utils/interface/auth";

type CommentsProps = {
  selectedPost: Post | null;
  communityId: string;
  user: User | null;
};

const Comments: React.FC<CommentsProps> = ({
  selectedPost,
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const setPostState = useSetRecoilState(postState);
  const showToast = useCustomToast();
  const user = useAuth();

  const onCreateComment = async () => {
    setCreateLoading(true);
    try {
      const response = await fetch(`/api/comment/post?postId=${selectedPost?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: commentText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setComments(prev => [data.data, ...prev])
      setCommentText("");
      showToast({
        title: "Comment Created",
        description: "Your comment has been created",
        status: "success",
      });
    } catch (error) {
      console.log("Error: OnCreateComment", error);
      showToast({
        title: "Comment not Created",
        description: "There was an error creating your comment",
        status: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const onDeleteComment = async (comment: Comment) => {
    setLoadingDelete(comment.id);
    try {
      const response = await fetch(`/api/comment/delete?commentId=${comment.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setComments(prev => prev.filter(com => com.id !== comment.id));
      showToast({
        title: "Comment Deleted",
        description: "Your comment has been deleted",
        status: "success",
      });
    } catch (error) {
      console.log("Error: onDeleteComment");
      showToast({
        title: "Comment not Deleted",
        description: "There was an error creating your comment",
        status: "error",
      });
    }
  };
  const getPostComments = async () => {
    setIsLoading(true);
    if (selectedPost) {
      try {
        const response = await fetch(`/api/comment/get?postId=${selectedPost.id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Something went wrong");
        }
        setComments(data.data);
      } catch (error) {
        showToast({
          title: "Error",
          description: "Failed to fetch comments",
          status: "error",
        });
      }
    }
    setIsLoading(false);
  };

  const onEditComment = async (comment: Comment) => {
    setEditingComment(comment);
    setCommentText(comment.text);
  }

  const onUpdateComment = async () => {
    if (!editingComment) return;
    setCreateLoading(true);

    try {
      const response = await fetch(`/api/comment/edit?commentId=${editingComment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: commentText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setComments(prev => prev.map(comment => {
        if (comment.id === editingComment.id) {
          return data.data;
        }
        return comment;
      }));
      setCommentText("");
      setEditingComment(null);
      showToast({
        title: "Comment Updated",
        description: "Your comment has been updated",
        status: "success",
      });
    } catch (error) {
      console.log("Error: OnUpdateComment", error);
      showToast({
        title: "Comment not Updated",
        description: "There was an error updating your comment",
        status: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  }

  /**
   * Fetch comments for the selected post when selected post changes.
   * If there is no selected post then do not fetch comments.
   */
  useEffect(() => {
    if (!selectedPost) {
      return;
    }
    getPostComments();
  }, [selectedPost?.id]);

  return (
    <Flex
      direction="column"
      border="1px solid"
      borderColor="gray.300"
      bg="white"
      borderRadius={10}
      pt={4}
      shadow="md"
    >
      <Flex
        direction="column"
        pl={10}
        pr={4}
        mb={6}
        fontSize="10pt"
        width="100%"
      >
        <CommentInput
          commentText={commentText}
          setCommentText={setCommentText}
          createLoading={createLoading}
          onCreateComment={editingComment ? onUpdateComment : onCreateComment}
        />
      </Flex>
      <Stack spacing={1} m={4} ml={5}>
        {isLoading ? (
          <>
            {[0, 1, 2, 3].map((item) => (
              <Box key={item} padding="6" bg="white">
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={3} spacing="4" />
              </Box>
            ))}
          </>
        ) : (
          <>
            {comments.length === 0 ? (
              <Flex direction="column" justify="center" align="center" p={20}>
                <Text fontWeight={600} opacity={0.3}>
                  {" "}
                  No Comments
                </Text>
              </Flex>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onDeleteComment={onDeleteComment}
                    onEditComment={onEditComment}
                    loadingDelete={loadingDelete === comment.id}
                    userId={user?.id}
                  />
                ))}
              </>
            )}
          </>
        )}
      </Stack>
    </Flex>
  );
};
export default Comments;
