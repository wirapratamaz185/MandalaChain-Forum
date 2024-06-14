import { Box, Flex, Icon, Spinner, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { CgProfile } from "react-icons/cg";
import { formatDate } from "@/utils/formatDate";

type CommentItemProps = {
  comment: Comment;
  onDeleteComment: (comment: Comment) => void;
  onEditComment: (comment: Comment) => void;
  loadingDelete: boolean;
  userId?: string;
};
export type Comment = {
  id: string;
  creatorId: string;
  user: {
    id: string;
    username: string;
  };
  communityId: string;
  postId: string;
  postTitle: string;
  text: string;
  created_at: string | Date;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDeleteComment,
  onEditComment,
  loadingDelete,
  userId,
}) => {
  return (
    <Flex
      border="1px solid"
      bg="white"
      borderColor="gray.300"
      borderRadius={10}
      shadow="sm"
    >
      <Flex m={2}>
        <Box>
          <Icon as={CgProfile} fontSize={30} color="gray.300" mr={2} />
        </Box>
        <Stack spacing={3}>
          <Stack direction="row" align="center" fontSize="8pt">
            <Text fontWeight={600}>{comment.user.username}</Text>
            <Text>{formatDate(comment.created_at)}</Text>
            {loadingDelete && <Spinner size="sm" />}
          </Stack>
          <Text fontSize="10pt">{comment.text}</Text>
          <Stack
            direction="row"
            align="center"
            cursor="pointer"
            color="gray.500"
          >
            {userId === comment.creatorId && (
              <>
                <Text
                  fontSize="10pt"
                  _hover={{ color: "blue.500" }}
                  onClick={() => onEditComment(comment)}
                >
                  Edit
                </Text>
                <Text
                  fontSize="10pt"
                  _hover={{ color: "blue.500" }}
                  onClick={() => onDeleteComment(comment)}
                >
                  Delete
                </Text>
              </>
            )}
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  );
};

export default CommentItem;