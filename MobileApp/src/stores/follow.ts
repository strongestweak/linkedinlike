import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import {FollowType} from '../screens/FollowScreen';
import axiosInstance from '../utils/axiosInstance';
import errorMessage from '../utils/errorMessage';
import {StateLoading, StateLoadingPagination} from '../utils/types';
import useAuthStore, {User} from './auth';
import useUserStore from './user';

export interface UserFollow {
  id: number;
  UserId: number;
  FollowId: number;
  User?: User;
  Follow?: User;
}

interface FollowStates {
  follower: Record<string, StateLoadingPagination<UserFollow[]>>;
  following: Record<string, StateLoadingPagination<UserFollow[]>>;
  userFollow: Record<string, StateLoading<UserFollow>>;
  createdFollow: Record<string, StateLoading<UserFollow>>;
}
interface FollowActions {
  fetchUserFollowList: (type: FollowType, UserId: number) => Promise<void>;
  fetchUserFollow: (followerId: number, followingId: number) => Promise<void>;
  createFollow: (userId: number) => Promise<void>;
  deleteFollow: (userFollow: UserFollow) => Promise<void>;
}

const useFollowStore = create<FollowStates & FollowActions>()(
  devtools(
    persist(
      (set, get) => ({
        userFollow: {},
        follower: {},
        following: {},
        createdFollow: {},
        fetchUserFollowList: async (type, UserId) => {
          const key = UserId || 'All';

          const updateUserFollowList = (
            data: StateLoadingPagination<UserFollow[]>,
            shouldAppend?: boolean,
          ) => {
            set(state => {
              const cData = state[type][key] || {};
              if (shouldAppend) {
                data.data = [...(cData.data || []), ...(data.data || [])];
              }
              return {
                ...state,
                [type]: {...state[type], [key]: {...cData, ...data}},
              };
            });
          };

          let cState;
          if (type === FollowType.follower) {
            cState = get().follower;
          } else {
            cState = get().following;
          }
          if (cState[UserId]?.isLoading) {
            return;
          }
          updateUserFollowList({isLoading: true});
          try {
            const {data} = await axiosInstance({
              url: '/rest/UserFollow',
              params: {
                include: 'User,Follow',
                [type === FollowType.follower ? 'FollowId' : 'UserId']: UserId,
              },
            });

            updateUserFollowList({isLoading: false, data});
          } catch (err) {
            console.log('err', err);
            updateUserFollowList({isLoading: false, error: errorMessage(err)});
          }
        },
        fetchUserFollow: async (followerId, followingId) => {
          const key = followerId + '-' + followingId;
          const updateUserFollow = (data: StateLoading<UserFollow>) => {
            set(state => {
              const cData = state.userFollow[key] || {};
              return {
                ...state,
                userFollow: {...state.userFollow, [key]: {...cData, ...data}},
              };
            });
          };

          const cState = get().userFollow[key];
          if (cState?.isLoading) {
            return;
          }

          updateUserFollow({isLoading: true});
          try {
            const {data} = await axiosInstance({
              url: '/rest/UserFollow',
              params: {
                UserId: followerId,
                FollowId: followingId,
              },
            });
            const firstItem = (data || [])[0];
            updateUserFollow({isLoading: false, data: firstItem});
          } catch (err) {
            console.log(err);
            updateUserFollow({isLoading: false, error: errorMessage(err)});
          }
        },
        createFollow: async userId => {
          const updateCreateFollow = (
            data: StateLoadingPagination<UserFollow>,
          ) => {
            set(state => {
              return {
                createdFollow: {
                  ...state.createdFollow,
                  [userId]: data,
                },
              };
            });
          };
          updateCreateFollow({isLoading: true});
          try {
            const cUser = useAuthStore.getState().user as User;
            const {data} = await axiosInstance({
              method: 'POST',
              url: '/rest/UserFollow',
              data: {
                UserId: cUser.id,
                FollowId: userId,
              },
            });
            await get().fetchUserFollow(cUser?.id, userId);
            await useUserStore
              .getState()
              .fetchUser(cUser?.id, {scope: 'with-following'});
            updateCreateFollow({isLoading: false, data});
          } catch (err) {
            Alert.alert(errorMessage(err));
            updateCreateFollow({isLoading: false, error: errorMessage(err)});
          }
        },
        deleteFollow: async (userFollow: UserFollow) => {
          const updateCreateFollow = (
            data: StateLoadingPagination<UserFollow>,
          ) => {
            set(state => {
              return {
                createdFollow: {
                  ...state.createdFollow,
                  [userFollow.FollowId]: data,
                },
              };
            });
          };
          updateCreateFollow({isLoading: true});
          try {
            const cUser = useAuthStore.getState().user as User;
            const {data} = await axiosInstance({
              method: 'DELETE',
              url: '/rest/UserFollow/' + userFollow.id,
            });
            await get().fetchUserFollowList(FollowType.following, cUser.id);
            await get().fetchUserFollow(cUser?.id, userFollow.FollowId);
            await useUserStore
              .getState()
              .fetchUser(userFollow.FollowId, {scope: 'with-follower'});
            updateCreateFollow({isLoading: false, data});
          } catch (err) {
            Alert.alert(errorMessage(err));
            updateCreateFollow({isLoading: false, error: errorMessage(err)});
          }
        },
      }),
      {
        name: 'follow-storage',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  ),
);

export default useFollowStore;
