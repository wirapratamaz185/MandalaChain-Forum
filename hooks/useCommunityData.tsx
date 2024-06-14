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

  const toggleCommunitySubscription = async (communityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/subscribe?communityId=${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to toggle community subscription');
  
      const action = data.message.includes('unsubscribed') ? 'left' : 'joined';
      // console.log("Checking data:", data.message);
      showToast({
        title: `Community ${action}`,
        description: `You have successfully ${action} the community.`,
        status: 'success',
      });
  
      fetchMySnippets();
    } catch (error) {
      showToast({
        title: 'Failed to toggle subscription',
        description: (error as Error).message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCommunityData = useCallback(async (communityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/getdetail?communityId=${communityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setCommunityStateValue(prev => ({ ...prev, currentCommunity: data.data }));
    } catch (error) {
      showToast({ title: 'Fetch Error', description: (error as any).message, status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [setCommunityStateValue, showToast]);

  const onJoinOrLeaveCommunity = async (communityId: string, isJoined: boolean) => {
    await toggleCommunitySubscription(communityId);
  }

  useEffect(() => {
    const { communityId } = router.query;
    if (communityId && typeof communityId === 'string' && !communityStateValue.currentCommunity) {
      getCommunityData(communityId);
    }
    fetchMySnippets();
  }, [communityStateValue.currentCommunity, getCommunityData, router.query, fetchMySnippets]);

  return {
    communityStateValue,
    toggleCommunitySubscription,
    getCommunityData,
    onJoinOrLeaveCommunity,
    loading,
    router,
    showToast
  };
};

export default useCommunityData;