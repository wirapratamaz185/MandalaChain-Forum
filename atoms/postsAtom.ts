// atoms/postsAtom.ts:
import { atom } from "recoil";

export type Post = {
  user: any;
  id?: string; 
  communityId: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  body: string;
  numberOfComments: number;
  voteStatus: number;
  imageURL?: string;
  communityImageURL?: string;
  createTime: Date;
};

/**
 * Snippet representing user voting on a post.
 * This snippet is stored in the `users` collection
 * Stores the ID of the post, ID of the community of that post, and whether it was liked or disliked (+-1)
 * @property {string} id - ID of the snippet
 * @property {string} postId - ID of the post
 * @property {string} communityId - ID of the community the post belongs to
 * @property {number} voteValue - whether the post was liked or disliked by the current user (1 or -1)
 */
export type PostVote = {
  id: string;
  postId: string;
  communityId: string;
  voteValue: number;
};

/**
 * Represents the base state for the Recoil atom.
 * @property {Post | null} selectedPost - the post that is currently selected
 * @property {Post[]} posts - all the posts
 * @property {PostVote[]} postVotes - all the post votes
 */
interface PostState {
  selectedPost: Post | null; // when user opens a post
  posts: Post[]; //  all the post
  postVotes: PostVote[];
}

/**
 * Represents the default state of the Recoil atom.
 * Initially:
 *  - No post is selected
 *  - There are no posts to be displayed
 *  - Posts have not been voted on by the current user
 * @property {Post | null} selectedPost - null as no post is selected
 * @property {Post[]} posts - empty array as there are no posts
 * @property {PostVote[]} postVotes - empty array as posts have not been voted on
 *
 * @requires PostState - default state type
 */
const defaultPostState: PostState = {
  selectedPost: null,
  posts: [],
  postVotes: [],
};

/**
 * Atom which describes the recoil state of the posts.
 * Initially:
 *  - No post is selected
 *  - There are no posts to be displayed
 *  - Posts have not been voted on by the current user
 * @property {"postState"} key - "postState"
 * @property {PostState} default - default state of the atom
 *
 * @requires PostState - type of the state
 * @requires defaultPostState - default state of the atom
 *
 * @see https://recoiljs.org/docs/basic-tutorial/atoms/
 */
export const postState = atom<PostState>({
  key: "postState",
  default: defaultPostState,
});
