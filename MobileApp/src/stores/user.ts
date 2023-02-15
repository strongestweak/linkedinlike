import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';
import errorMessage from '../utils/errorMessage';
import {StateLoading} from '../utils/types';
import {User} from './auth';

interface UserStates {
  userList: Record<string, StateLoading<User>>;
}
interface UserActions {
  fetchUser: (userId: number, params?: any) => Promise<void>;
}

const useUserStore = create<UserStates & UserActions>()(
  devtools(
    persist(
      (set, get) => ({
        userList: {},
        fetchUser: async (userId, params = {}) => {
          const updateArticleList = (data: StateLoading<User>) => {
            set(state => {
              const cData = state.userList[userId] || {};
              const stateData = {...cData, ...data};
              if (stateData.data) {
                stateData.data = {
                  ...(cData.data || {}),
                  ...(data.data || {}),
                } as User;
              }
              return {
                ...state,
                userList: {...state.userList, [userId]: stateData},
              };
            });
          };
          try {
            const cState = get().userList[userId];
            if (cState.isLoading) {
              return;
            }
            updateArticleList({isLoading: true, error: undefined});
            const {data} = await axiosInstance({
              url: '/rest/User/' + userId,
              params: {scope: 'with-follower', ...params},
            });
            updateArticleList({isLoading: false, data});
          } catch (err) {
            updateArticleList({isLoading: false, error: errorMessage(err)});
          }
        },
      }),
      {
        name: 'user',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  ),
);

export default useUserStore;
