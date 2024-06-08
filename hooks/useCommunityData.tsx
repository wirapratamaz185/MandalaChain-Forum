// hooks/useCommunityData.tsx
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';
import { communityState } from "@/atoms/communitiesAtom";
import { useAuth } from './useAuth';
import useCustomToast from './useCustomToast';

const useCommunityData = () => {
  const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const showToast = useCustomToast();

  const fetchMySnippets = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("Fetching user snippets...");
      const response = await fetch(`/api/community/snippets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `{access_token}`,
        },
      });
      const data = await response.json();
      console.log("User snippets response:", data);
      if (!response.ok) throw new Error(data.message || "Could not fetch user snippets.");
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: data.data,
      }));
      console.log("Updated communityStateValue:", communityStateValue);
    } catch (error) {
      const errMessage = (error as Error).message;
      showToast({
        title: 'Error fetching user snippets',
        description: errMessage,
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [user, setCommunityStateValue, showToast]);

  const joinCommunity = async (communityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/subscribe?communityId=${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Already joined the community');
      showToast({
        title: 'Joined Community',
        description: 'You have successfully joined the community.',
        status: 'success',
      });

      // Optionally update community data
      fetchMySnippets();
    } catch (error) {
      showToast({
        title: 'Failed to Join',
        description: (error as Error).message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveCommunity = useCallback(async (communityId: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/unsubscribe?communityId=${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to leave the community');
      showToast({
        title: "Community Left",
        description: "You have successfully left the community.",
        status: "success",
      });

      fetchMySnippets();
    } catch (error) {
      showToast({
        title: "Leave community failed",
        description: (error as Error).message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast, setLoading, fetchMySnippets]);

  const getCommunityData = useCallback(async (communityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/getdetail?communityId=${communityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // console.log("API response status:", response.status);
      const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Failed to fetch community details');
      setCommunityStateValue(prev => ({ ...prev, currentCommunity: data.data }));
    } catch (error) {
      // showToast({ title: 'Fetch Error', description: (error as any).message, status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [setCommunityStateValue, showToast]);

  const onJoinOrLeaveCommunity = async (communityId: string, isJoined: boolean) => {
    if (isJoined) {
      await leaveCommunity(communityId);
    } else {
      await joinCommunity(communityId);
    }
  }

  useEffect(() => {
    const { communityId } = router.query;
    if (communityId && typeof communityId === 'string' && !communityStateValue.currentCommunity) {
      getCommunityData(communityId);
    }
    // Fetch user snippets when the component mounts
    fetchMySnippets();
  }, [communityStateValue.currentCommunity, getCommunityData, router.query, fetchMySnippets]);

  return {
    communityStateValue,
    joinCommunity,
    leaveCommunity,
    getCommunityData,
    onJoinOrLeaveCommunity,
    loading,
    router,
    showToast
  };
};

export default useCommunityData;