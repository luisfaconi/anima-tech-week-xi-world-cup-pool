import { defineStore } from 'pinia';
import { ref } from 'vue';
import { poolService, type Pool } from '../services/api/poolService';

export const usePoolStore = defineStore('pool', () => {
  const pools = ref<Pool[]>([]);
  const currentPool = ref<Pool | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUserPools(userId: number) {
    loading.value = true;
    error.value = null;
    try {
      pools.value = await poolService.listUserPools(userId);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch pools';
      console.error('Error fetching pools:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPoolById(poolId: number) {
    loading.value = true;
    error.value = null;
    try {
      currentPool.value = await poolService.getPoolById(poolId);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch pool';
      console.error('Error fetching pool:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createPool(data: {
    name: string;
    description?: string;
    ownerId: number;
    scoringRules?: any;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const newPool = await poolService.createPool(data);
      pools.value.unshift(newPool);
      return newPool;
    } catch (err: any) {
      error.value = err.message || 'Failed to create pool';
      console.error('Error creating pool:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function joinPool(userId: number, inviteCode: string) {
    loading.value = true;
    error.value = null;
    try {
      await poolService.joinPool({ userId, inviteCode });
      // Refresh pools after joining
      await fetchUserPools(userId);
    } catch (err: any) {
      error.value = err.message || 'Failed to join pool';
      console.error('Error joining pool:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    pools,
    currentPool,
    loading,
    error,
    fetchUserPools,
    fetchPoolById,
    createPool,
    joinPool,
  };
});
