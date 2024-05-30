// pages/community/[communityId]/index.tsx
import { Community, communityState } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
// import CreatePostLink from "@/components/Community/CreatePostLink";
import Header from "@/components/Community/Header";
import NotFound from "@/components/Community/NotFound";
import PageContent from "@/components/Layout/PageContent";
import Posts from "@/components/Posts/Posts";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";
import { getCookie } from "cookies-next";

/**
 * @param {Community} communityData - Community data for the current community
 */
type CommunityPageProps = {
  communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState);

  useEffect(() => {
    if (communityData) {
      setCommunityStateValue(prev => ({
        ...prev,
        currentCommunity: communityData,
      }));
    } else {
      console.log("No community data available");
    }
  }, []);

  if (!communityData || Object.keys(communityData).length === 0) {
    return <NotFound />;
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          {/* <CreatePostLink /> */}
          <Posts communityId={communityData.id} />
        </>
        <About communityData={communityData} />
      </PageContent>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { communityId } = context.query;
  console.log("Community ID in getServerSideProps:", communityId);

  if (!communityId) {
    console.error("Community ID is not provided.");
    return { props: { communityData: {} } };
  }

  const token = getCookie("access_token", { req: context.req });

  if (!token) {
    console.error("No access token found in cookies.");
    return { props: { communityData: {} } };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `access_token=${token}`,
  };

  try {
    const url = `http://localhost:3000/api/community/getdetail?communityId=${communityId}`;
    const response = await fetch(url, { method: "GET", headers });
    console.log("API response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch data, received status ${response.status}`);
    }

    const data = await response.json();
    return {
      props: { communityData: JSON.parse(safeJsonStringify(data)) },
    };
  } catch (error) {
    console.error("Error in fetching community details:", (error as any).message);
    return { props: { communityData: {} } };
  }
}

export default CommunityPage;