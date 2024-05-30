// components/Posts/PostItem.tsx
import { Post } from "@/atoms/postsAtom";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Skeleton,
  Stack,
  Text,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { BsBookmark } from "react-icons/bs";
import { FiShare2 } from "react-icons/fi";
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoPeopleCircleOutline,
} from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";
import PostItemError from "../atoms/ErrorMessage";
import { event } from "firebase-functions/v1/analytics";

type PostItemProps = {
  post: Post;
  userIsCreator: boolean; // is the currently logged in user the creator of post
  userVoteValue?: number; // value of the vote of the currently logged in user
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    community_id: string
  ) => void; // function to handle voting
  onDeletePost: (post: Post) => Promise<boolean>; // function to handle deleting post
  onSelectPost?: (post: Post) => void; // optional because once a post is selected it cannot be reselected
  onBookmarkPost: (post: Post) => Promise<boolean>;
  showCommunityImage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  onBookmarkPost,
  showCommunityImage,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [error, setError] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const router = useRouter();
  const showToast = useCustomToast();
  const { onCopy, value, setValue, hasCopied } = useClipboard("");
  /**
   * If there is no selected post then post is already selected
   */
  const singlePostPage = !onSelectPost;

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation(); // stop event bubbling up to parent
    setLoadingDelete(true);
    try {
      const success: boolean = await onDeletePost(post); // call the delete function from usePosts hook

      if (!success) {
        // if the post was not deleted successfully
        throw new Error("Post could not be deleted"); // throw error
      }

      showToast({
        title: "Post Deleted",
        description: "Your post has been deleted",
        status: "success",
      });
      // if the user deletes post from the single post page, they should be blueirected to the post's community page
      if (singlePostPage) {
        // if the post is on the single post page
        router.push(`/community/${post.community.name}`); // blueirect to the community page
      }
    } catch (error: any) {
      setError(error.message);
      showToast({
        title: "Post not Deleted",
        description: "There was an error deleting your post",
        status: "error",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleBookmark = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation(); // stop event bubbling up to parent
    setLoadingBookmark(true);
    try {
      const success: boolean = await onBookmarkPost(post);

      if (!success) {
        throw new Error("Post could not be bookmarked/unbookmarked");
      }

      showToast({
        title: post.isBookmarked ? "Post Unbookmarked" : "Post Bookmarked",
        description: post.isBookmarked ? "This post has been unbookmarked" : "This post has been bookmarked",
        status: "success",
      });

      // Toggle the bookmark state
      // setPostStateValue(prev => ({
      //   ...prev,
      //   posts: prev.posts.map((p: Post) => p.id === post.id ? { ...p, isBookmarked: !p.isBookmarked } : p),
      // }));
    } finally {
      setLoadingBookmark(false);
    }
  }

  const handleShare = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation(); // stop event bubbling up to parent
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const postLink = `${baseUrl}/community/${post.community.name}/comments/${post.id}`;
    setValue(postLink);
    onCopy(); // copy link to clipboard

    showToast({
      title: "Link Copied",
      description: "Link to the post has been saved to your clipboard",
      status: "info",
    });
  };

  // const handleSave = (
  //   event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  // ) => {
  //   event.stopPropagation(); // stop event bubbling up to parent

  //   showToast({
  //     title: "Functionality Coming Soon",
  //     description: "Currently, this functionality is not available",
  //     status: "warning",
  //   });
  // };

  return (
    <Flex
      border="1px solid"
      bg="white"
      borderColor="gray.300"
      borderRadius={10}
      _hover={{
        borderColor: singlePostPage ? "none" : "gray.400",
        boxShadow: !singlePostPage && "xl",
      }}
      cursor={singlePostPage ? "unset" : "pointer"}
      onClick={() => onSelectPost && onSelectPost(post)} // if a post is selected then open post
      shadow="md"
    >
      {/* Left Section */}
      <Flex
        direction="column"
        align="center"
        bg={singlePostPage ? "none" : "gray.100"}
        p={2}
        width="40px"
        borderRadius={singlePostPage ? "0" : "10px 0px 0px 10px"}
      >
        <VoteSection
          userVoteValue={userVoteValue}
          onVote={onVote}
          post={post}
        />
      </Flex>

      {/* Right Section  */}
      <Flex direction="column" width="100%">
        <Stack spacing={1} p="10px">
          <PostDetails showCommunityImage={true} postDetail={post} />
          <PostTitle post={post} />
          <PostBody
            post={post}
            loadingImage={loadingImage}
            setLoadingImage={setLoadingImage}
          />
        </Stack>
        <PostActions
          handleDelete={handleDelete}
          loadingDelete={loadingDelete}
          userIsCreator={userIsCreator}
          handleShare={handleShare}
          loadingBookmark={loadingBookmark}
          handleBookmark={handleBookmark}
        />
        <PostItemError
          error={error}
          message={"There was an error when loading this post"}
        />
      </Flex>
    </Flex>
  );
};
export default PostItem;

type VoteSectionProps = {
  userVoteValue?: number;
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    community_id: string
  ) => void;
  post: Post;
};

const VoteSection: React.FC<VoteSectionProps> = ({
  userVoteValue,
  onVote,
  post,
}) => {
  return (
    <>
      {/* like button */}
      <Icon
        as={userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline}
        color={userVoteValue === 1 ? "blue.500" : "gray.500"}
        fontSize={22}
        cursor="pointer"
        _hover={{ color: "blue.300" }}
        onClick={(event) => onVote(event, post, 1, post.community.name)}
      />
      {/* number of likes  */}
      <Text fontSize="12pt" color="gray.600">
        {post.voteStatus}
      </Text>
      {/* dislike button */}
      <Icon
        as={
          userVoteValue === -1
            ? IoArrowDownCircleSharp
            : IoArrowDownCircleOutline
        }
        color={userVoteValue === -1 ? "blue.500" : "gray.500"}
        _hover={{ color: "blue.300" }}
        fontSize={22}
        cursor="pointer"
        onClick={(event) => onVote(event, post, -1, post.community.name)}
      />
    </>
  );
};

type PostDetailsProps = {
  showCommunityImage?: boolean;
  postDetail: Post;
};

const PostDetails = ({ showCommunityImage, postDetail }: PostDetailsProps) => {
  const data: any = postDetail;
  const correctData: Post = data.data;
  // console.log("correctData", correctData);
  // console.log("Data", postDetail)

  const createdAt = moment(postDetail.created_at)
  const formattedDate = createdAt.isValid() ? createdAt.format("MMMM DD, YYYY") : "Invalid date";

  const topText: string = `By ${postDetail.user.username} ${formattedDate}`;

  return (
    <>
      <Stack
        direction="row"
        spacing={0.5}
        align="center"
        fontSize="9pt"
        borderRadius="full"
        boxSize="18px"
        mr={2}
        width="100%"
      >
        {showCommunityImage && postDetail.community && (
          <>
            {postDetail.imageURL ? (
              <Image
                borderRadius="full"
                boxSize="18px"
                src={postDetail.imageURL}
                mr={2}
                alt="Community logo"
              />
            ) : (
              <Icon
                as={IoPeopleCircleOutline}
                mr={1}
                fontSize="18pt"
                color="blue.500"
              />
            )}
            <Link href={`/community/${postDetail.community.name}`}>
              <Text
                fontWeight={700}
                _hover={{ textDecoration: "underline" }}
                pr={2}
                onClick={(event) => event.stopPropagation()}
              >
                {postDetail.community.name}
              </Text>
            </Link>
          </>
        )}
        <Text fontWeight={500}>{topText}</Text>
      </Stack>
    </>
  );
};

type PostTitleProps = {
  post: Post;
};

const PostTitle = ({ post }: PostTitleProps) => {
  // const data: any = post;
  // const correctData: Post = data.data;
  // console.log("correctData", correctData);
  return (
    <Text fontSize="12pt" fontWeight={600}>
      {post.title}
    </Text>
  );
};

type PostBodyProps = {
  post: Post;
  loadingImage: boolean;
  setLoadingImage: (value: React.SetStateAction<boolean>) => void;
};


const PostBody = ({ post, loadingImage, setLoadingImage }: PostBodyProps) => {
  // const data: any = post;
  // const correctData: Post = data.data;
  // console.log("correctData", correctData);
  return (
    <>
      <Text fontSize="12pt">
        {/* only displays the first 30 words for descriptions that are too long */}
        {post.body.split(" ").slice(0, 30).join(" ")}
      </Text>
      {/* image (if exists) */}
      {post.imageURL && (
        <Flex justify="center" align="center">
          {loadingImage && (
            <Skeleton height="300px" width="100%" borderRadius={10} />
          )}
          <Image
            mt={4}
            src={post.imageURL}
            alt="Image for post"
            maxHeight="450px"
            maxWidth="100%"
            borderRadius="10px"
            display={loadingImage ? "none" : "unset"}
            onLoad={() => setLoadingImage(false)}
            shadow="md"
          />
        </Flex>
      )}
    </>
  );
};


interface PostActionsProps {
  handleDelete: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  loadingDelete: boolean;
  loadingBookmark: boolean;
  userIsCreator: boolean;
  handleShare: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleBookmark: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>;
}

const PostActions: React.FC<PostActionsProps> = ({
  handleDelete,
  loadingDelete,
  loadingBookmark,
  userIsCreator,
  handleShare,
  handleBookmark,
}) => (
  <Stack
    ml={1}
    mb={1}
    color="gray.500"
    fontWeight={600}
    direction="row"
    spacing={1}
  >
    <Button variant="action" height="32px" onClick={handleShare}>
      <Icon as={FiShare2} mr={2} />
      <Text fontSize="9pt">Share</Text>
    </Button>

    <Button variant="action" height="32px" onClick={handleBookmark} isLoading={loadingBookmark}>
      <Icon as={BsBookmark} mr={2} />
      <Text fontSize="9pt">Save</Text>
    </Button>

    {userIsCreator && (
      <Button
        variant="action"
        height="32px"
        onClick={handleDelete}
        isLoading={loadingDelete}
      >
        <Icon as={MdOutlineDelete} mr={2} />
        <Text fontSize="9pt">Delete</Text>
      </Button>
    )}
  </Stack>
);