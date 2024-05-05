// atoms/communitiesAtom.ts
import { atom } from "recoil";

// Interface representing a community.
 
export interface Community {
  name: any;
  id: string;
  creatorId: string;
  numberOfMembers: number;
  privacyType: "public" | "private";
  createdAt?: Date;
  imageURL?: string;
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
