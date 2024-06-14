import { Post } from "@/atoms/postsAtom";
import { Community } from "@/atoms/communitiesAtom";
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
import React, { useEffect, useState } from "react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
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

type PostItemProps = {
  post: Post;
  userIsCreator: boolean;
  userVoteValue?: number;
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
  ) => void;
  onDeletePost: (post: Post) => Promise<boolean>;
  onSelectPost?: (post: Post) => void;
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
  const [voteCount, setVoteCount] = useState<number | null>(null);
  const [fetchedImage, setFetchedImage] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const singlePostPage = !onSelectPost;

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const response = await fetch(`/api/posts/bookmarked`);
        const data = await response.json();
        if (response.ok) {
          setBookmarked(data.data.includes(post.id));
        } else {
          throw new Error("Failed to fetch bookmarked posts");
        }
      } catch (error) {
        console.error("Error: fetchBookmarkedPosts", error);
      }
    };

    fetchBookmarkedPosts();
  }, [post.id]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/getbyId?postId=${post.id}`);
        const data = await response.json();
        if (response.ok && data.data) {
          setFetchedImage(data);
          setVoteCount(data.data.vote);
          setCommunities([data.data.community])
          // console.log("Communities:", data.data.community.imageUrl);
        } else {
          throw new Error("Failed to get image");
        }
      } catch (error) {
        console.error("Error: fetchImage", error);
      }
    };

    fetchPost();
  }, [post.id]);

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setLoadingDelete(true);
    try {
      const success: boolean = await onDeletePost(post);

      if (!success) {
        throw new Error("Post could not be deleted");
      }

      showToast({
        title: "Post Deleted",
        description: "Your post has been deleted",
        status: "success",
      });
      if (singlePostPage) {
        router.push(`/community/${post.community_id}`);
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
    event.stopPropagation();
    setLoadingBookmark(true);
    try {
      const success: boolean = await onBookmarkPost(post);

      if (!success) {
        throw new Error("Post could not be bookmarked/unbookmarked");
      }

      showToast({
        title: bookmarked ? "Post Unbookmarked" : "Post Bookmarked",
        description: bookmarked ? "This post has been unbookmarked" : "This post has been bookmarked",
        status: "success",
      });

      setBookmarked(!bookmarked);
    } catch (error) {
      console.error("Error in handleBookmark:", error);
      showToast({
        title: "Could not Bookmark Post",
        status: "error",
      });
    } finally {
      setLoadingBookmark(false);
    }
  };

  const handleShare = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const postLink = `${baseUrl}/community/${post.community_id}/comments/${post.id}`;
    setValue(postLink);
    onCopy();

    showToast({
      title: "Link Copied",
      description: "Link to the post has been saved to your clipboard",
      status: "info",
    });
  };

  const handleVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number
  ) => {
    event.stopPropagation();
    try {
      await onVote(event, post, vote);

      // Fetch the updated vote count from the API
      const response = await fetch(`/api/posts/getvote?postId=${post.id}`);
      const data = await response.json();

      // console.log("API response:", data);

      if (response.ok && data.data) {
        setVoteCount(data.data.vote);
        // console.log("Updated vote count:", data.data.vote);

        const userVote = data.data.userVote;
        // console.log("isUp vote:", userVote);
        // setUserVote(userVote);
      } else {
        throw new Error("Failed to get updated vote count");
      }
    } catch (error) {
      console.error("Error in handleVote:", error);
    }
  };

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
    >
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
          onVote={handleVote}
          post={post}
          voteCount={voteCount}
        />
      </Flex>

      <Flex direction="column" width="100%">
        <Stack spacing={1} p="10px">
          <PostDetails showCommunityImage={true} postDetail={post} communities={communities} />
          <PostTitle post={post} onSelectPost={onSelectPost} />
          <PostBody
            post={post}
            loadingImage={loadingImage}
            setLoadingImage={setLoadingImage}
          />
        </Stack>
        <PostActions
          post={{ ...post, bookmarked }}
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
  ) => void;
  post: Post;
  voteCount: number | null;
};

const VoteSection: React.FC<VoteSectionProps> = ({
  userVoteValue,
  onVote,
  post,
  voteCount,
}) => {
  const data: any = post;
  const correctData: Post = {
    ...data,
    posts: data.posts || { votes: { up: null } },
  };

  const [voteStatus, setVoteStatus] = useState(correctData.posts.votes.up);

  // useEffect(() => {
  //   setVoteStatus(correctData.posts.votes.up);
  // }, [correctData.posts.votes.up]);

  useEffect(() => {
    const fetchVoteStatus = async () => {
      try {
        const response = await fetch(`/api/posts/getvote?postId=${post.id}`);
        const result = await response.json();
        if (response.ok && result.data) {
          setVoteStatus(result.data.vote === 1);
        } else {
          throw new Error('Failed to fetch vote status');
        }
      } catch (error) {
        console.error('Error fetching vote status:', error);
      }
    };

    fetchVoteStatus();
  }, [post.id]);

  const handleVote = (event: React.MouseEvent<SVGElement, MouseEvent>, vote: number) => {
    onVote(event, post, vote);
    setVoteStatus(vote === 1);
  };

  const renderedOutput = (
    <>
      <Icon
        as={voteStatus === true ? IoArrowUpCircleSharp : IoArrowUpCircleOutline}
        color={voteStatus === true ? "blue.500" : "gray.500"}
        fontSize={22}
        cursor="pointer"
        _hover={{ color: "blue.300" }}
        onClick={(event) => handleVote(event, 1)}
      />
      <Text fontSize="12pt" color="gray.600">
        {voteCount || 0}
      </Text>
      <Icon
        as={voteStatus === false ? IoArrowDownCircleSharp : IoArrowDownCircleOutline}
        color={voteStatus === false ? "blue.500" : "gray.500"}
        _hover={{ color: "blue.300" }}
        fontSize={22}
        cursor="pointer"
        onClick={(event) => handleVote(event, -1)}
      />
    </>
  );

  return renderedOutput;
};

type PostDetailsProps = {
  showCommunityImage?: boolean;
  postDetail: Post;
  // communityDetail: Community;
  communities: Community[];
};

const PostDetails = ({ showCommunityImage, postDetail, communities }: PostDetailsProps) => {
  const createdAt = moment(postDetail.created_at);
  const formattedDate = createdAt.isValid() ? createdAt.format("MMMM DD, YYYY") : "Invalid date";

  const topText: string = `By ${postDetail.user?.username || 'Anonymous'} ${formattedDate}`;

  // console.log("Community Detail:", communityDetail);
  return (
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
      {showCommunityImage && communities.length > 0 && (
        <>
        <Link href={`/community/${communities[0].id}`}>
            <Image
              borderRadius="full"
              boxSize="18px"
              src={communities[0].imageUrl}
              mr={2}
              alt="Community logo"
            />
          </Link>
          <Link href={`/community/${postDetail.community_id}`}>
            <Text
              fontWeight={700}
              _hover={{ textDecoration: "underline" }}
              pr={2}
              onClick={(event) => event.stopPropagation()}
            >
              {postDetail.community?.name}
            </Text>
          </Link>
        </>
      )}
      <Text fontWeight={500}>{topText}</Text>
    </Stack>
  );
};

type PostTitleProps = {
  post: Post;
  onSelectPost?: (post: Post) => void;
};

const PostTitle = ({ post, onSelectPost }: PostTitleProps) => {
  return (
    <Text fontSize="12pt" fontWeight={600} _hover={{ textDecoration: "underline" }}
      onClick={() => onSelectPost && onSelectPost(post)}
      cursor="pointer"
      >
      {post.title}
    </Text >
  );
};

type PostBodyProps = {
  post: Post;
  loadingImage: boolean;
  setLoadingImage: (value: React.SetStateAction<boolean>) => void;
};

const PostBody = ({ post, loadingImage, setLoadingImage }: PostBodyProps) => {
  return (
    <>
      <Text fontSize="12pt">
        {post.body.split(" ").slice(0, 30).join(" ")}
      </Text>
      {post.imageUrl && (
        <Flex justify="center" align="center">
          {loadingImage && (
            <Skeleton height="300px" width="100%" borderRadius={10} />
          )}
          <Image
            mt={4}
            src={post.imageUrl}
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
  post: Post;
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
  post,
  handleDelete,
  loadingDelete,
  loadingBookmark,
  userIsCreator,
  handleShare,
  handleBookmark,
}) => {
  return (
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
        <Icon as={post.bookmarked ? BsBookmarkFill : BsBookmark} mr={2} color={post.bookmarked ? "gray.500" : "gray.300"} />
        <Text fontSize="9pt">{post.bookmarked ? "Unsave" : "Save"}</Text>
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
};