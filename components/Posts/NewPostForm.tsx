// components/Posts/NewPostForm.tsx
import { Community } from "@/atoms/communitiesAtom";
import { Post } from "@/atoms/postsAtom";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { MdOutlineArrowBackIos } from "react-icons/md";
import ImageUpload from "./PostForm/ImageUpload";
import TextInputs from "./PostForm/TextInputs";
import TabItem from "./TabItem";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/utils/interface/auth";


type NewPostFormProps = {
  user: User | null;
  communityId: string;
  communityImageURL?: string;
  currentCommunity?: Community;
};

const formTabs: FormTab[] = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images",
    icon: IoImageOutline,
  },
];

export type FormTab = {
  title: string;
  icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({
  user,
  communityId,
  communityImageURL,
  currentCommunity,
}) => {
  const router = useRouter();

  // debug data structure
  const data: any = currentCommunity;
  const correctData: Community = data.data;
  // console.log("Fix data", correctData);

  const [selectedTab, setSelectedTab] = useState(formTabs[0].title); // formTabs[0] = Post
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  });
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(
    3000,
    3000
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const showToast = useCustomToast();
  const communityLink = `/community/${correctData.id}`;

  const handleCreatePost = async () => {
    console.log("Community ID POST FORM:", correctData.id);

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", textInputs.title);
      formData.append("body", textInputs.body);
      if (selectedFile) {
        const file = dataURLtoFile(selectedFile, "image.png");
        formData.append("file", file);
      }
      // console.log("Selected File:", selectedFile);

      const response = await fetch(`/api/posts/post?communityId=${correctData.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const result = await response.json();
      router.push(communityLink); // redirect user back to communities page after post is created
    } catch (error: any) {
      console.log("Error: handleCreatePost", error.message);
      showToast({
        title: "Post not Created",
        description: "There was an error creating your post",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event;
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    })); // update the state
  };

  return (
    <Flex direction="column" bg="white" borderRadius={10} mt={2} shadow="md">
      <TabList
        formTabs={formTabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <BackToCommunityButton communityId={communityId} />
      <PostBody
        selectedTab={selectedTab}
        handleCreatePost={handleCreatePost}
        onTextChange={onTextChange}
        loading={loading}
        textInputs={textInputs}
        selectedFile={selectedFile}
        onSelectFile={onSelectFile}
        setSelectedTab={setSelectedTab}
        setSelectedFile={setSelectedFile}
      />
      <PostCreateError error={error} />
    </Flex>
  );
};
export default NewPostForm;

type TabListProps = {
  formTabs: FormTab[];
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
};

const TabList: React.FC<TabListProps> = ({
  formTabs,
  selectedTab,
  setSelectedTab,
}) => {
  return (
    <Stack width="100%" direction="row" spacing={2} p={2}>
      {formTabs.map((item) => (
        <TabItem
          key={item.title}
          item={item}
          selected={item.title === selectedTab}
          setSelectedTab={setSelectedTab}
        />
      ))}
    </Stack>
  );
};

interface BackToCommunityButtonProps {
  communityId: string;
}

const BackToCommunityButton: React.FC<BackToCommunityButtonProps> = ({
  communityId,
}) => {
  const router = useRouter();
  const communityLink = `/community/${communityId}`;
  console.log("Community ID:", communityId);

  return (
    <Button
      variant="outline"
      mt={4}
      ml={4}
      mr={4}
      justifyContent="left"
      width="fit-content"
      onClick={() => router.push(communityLink)}
    >
      <Icon as={MdOutlineArrowBackIos} mr={2} />
      {`Back to ${communityId}`}
    </Button>
  );
};

type PostBodyProps = {
  selectedTab: string;
  handleCreatePost: () => Promise<void>;
  onTextChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  loading: boolean;
  textInputs: {
    title: string;
    body: string;
  };
  selectedFile: string | undefined;
  onSelectFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const PostBody: React.FC<PostBodyProps> = ({
  selectedTab,
  handleCreatePost,
  onTextChange,
  loading,
  textInputs,
  selectedFile,
  onSelectFile,
  setSelectedTab,
  setSelectedFile,
}) => {
  return (
    <Flex p={4}>
      {selectedTab === "Post" && (
        <TextInputs
          textInputs={textInputs}
          handleCreatePost={handleCreatePost}
          onChange={onTextChange}
          loading={loading}
        />
      )}
      {selectedTab === "Images" && (
        <ImageUpload
          selectedFile={selectedFile}
          onSelectImage={onSelectFile}
          setSelectedTab={setSelectedTab}
          setSelectedFile={setSelectedFile}
        />
      )}
    </Flex>
  );
};

type Props = {
  error: boolean;
};

const PostCreateError: React.FC<Props> = ({ error }) => {
  return (
    <>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2} fontWeight={600} color="blue.500">
            There has been an error when creating your post
          </Text>
        </Alert>
      )}
    </>
  );
};

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};