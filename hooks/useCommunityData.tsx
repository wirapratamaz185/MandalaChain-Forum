// hooks/useCommunityData
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';
import { communityState } from "@/atoms/communitiesAtom";
import useCustomToast from './useCustomToast';

const useCommunityData = () => {
  const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showToast = useCustomToast();

  const joinCommunity = async (communityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/subscribe?communityId=${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to join the community');
      showToast({
        title: 'Joined Community',
        description: 'You have successfully joined the community.',
        status: 'success',
      });

      // Optionally update community data
      getCommunityData(communityId);
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

    } catch (error) {
      showToast({
        title: "Leave community failed",
        description: (error as Error).message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast, setLoading]);

  const getCommunityData = useCallback(async (communityId: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/getdetail?communityId=${communityId}`, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to get community data');
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: data,
      }));
    } catch (error) {
      showToast({
        title: 'Please log in to view this community',
        description: (error as Error).message,
        status: 'error',
      });
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
  }, [communityStateValue.currentCommunity, getCommunityData, router.query]);

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