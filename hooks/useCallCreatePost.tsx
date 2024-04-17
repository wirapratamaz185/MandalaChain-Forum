// hooks/useCallCreatePost.tsx
import { authModalState } from "@/atoms/authModalAtom";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import useDirectory from "./useDirectory";
import { useSession } from "next-auth/react"; // Import useSession from NextAuth

const useCallCreatePost = () => {
  const router = useRouter();
  const { data: session } = useSession(); // Use useSession to get the current session
  const setAuthModalState = useSetRecoilState(authModalState);
  const { toggleMenuOpen } = useDirectory();

  const onClick = () => {
    // Check if the user is logged in as post cannot be created without user
    if (!session) {
      // If user is not logged in
      setAuthModalState({ open: true, view: "login" }); // Open login modal
      return; // Exit function
    }
    const { communityId } = router.query; // Get community id from router

    if (communityId) {
      // If the user is in a community then can post
      // Redirect user to following link
      router.push(`/community/${communityId}/submit`); // Redirect user to create post page
      return;
    } else {
      // If the user is not in a community then post cannot be made
      toggleMenuOpen(); // Open the menu to select a community
    }
  };

  return {
    onClick,
  };
};

export default useCallCreatePost;