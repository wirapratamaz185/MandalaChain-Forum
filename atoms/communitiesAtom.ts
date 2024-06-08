// atoms/communitiesAtom.ts
import { atom } from "recoil";
import { Post } from "./postsAtom";

// Interface representing a community.
 
export interface Community {
  posts: Post[];
  id: string;
  name: string;
  owner_id: string;
  community_type: {
    id: string;
    type: "public" | "private";
  }
  created_at: Date;
  imageURL?: string;
  subscribers: {
    length: number;
    id: string;
  }
}

// The snippet representing a community a user us subscribed to
export interface CommunitySnippet {
  communityId: string;
  isAdmin?: boolean;
  imageURL?: string;
}

// Stores the community snippets to track the state of the communities atom.
interface CommunityState {
  mySnippets: CommunitySnippet[]; // stores a list of community snippets
  currentCommunity?: Community; // user is not always in a community hence optional
  snippetFetched: boolean;
}

// Initially, the array for the community state is empty.
const defaultCommunityState: CommunityState = {
  mySnippets: [],
  snippetFetched: false,
};

export const communityState = atom<CommunityState>({
  key: "communityState",
  default: defaultCommunityState,
});
