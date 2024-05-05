// pages/community/[communityId]/index.tsx
import { Community, communityState } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
import CreatePostLink from "@/components/Community/CreatePostLink";
import Header from "@/components/Community/Header";
import NotFound from "@/components/Community/NotFound";
import PageContent from "@/components/Layout/PageContent";
import Posts from "@/components/Posts/Posts";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";

/**
 * @param {Community} communityData - Community data for the current community
 */
type CommunityPageProps = {
  communityData: Community;
};

/**
 * Displays the community page with the community's posts and information.
 * @param {Community} communityData - Community data for the current community
 * @returns {React.FC<CommunityPageProps>} - Community page component
 */
const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState);
  const router = useRouter();

  // store the community data currently available into the state as soon as the component renders
  useEffect(() => {
    if (communityData) {
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: communityData,
      }));
    }
  }, [communityData, setCommunityStateValue]);

  if (!communityData || Object.keys(communityData).length === 0) {
    //  if community data is not available or empty, return not found page
    return <NotFound />;
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  );
};

/**
 * Gets the community data for the current community.
 * Returns the community data as props to the client.
 * @param {GetServerSidePropsContext} context - GetServerSidePropsContext object
 * @returns {Promise<{props: {communityData: Community}}>} - Community data for the current community
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // get the community data and pass it to the client
  // fetch API get community
  try {
    const response = await fetch(`http://localhost:3000/api/community/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        communityId: context.query.communityId as string,
      },
    });
    const data = await response.json();
    console.log(data);
    
    if (!data) {
      return { props: {} };
    }

    return {
      props: {
        communityData: JSON.parse(
          safeJsonStringify({ id: data.id, ...data })
        ),
      },
    };
  } catch (error) {
    console.log("Error: getServerSideProps", error);
    return { props: {} };
  }
}

export default CommunityPage;
