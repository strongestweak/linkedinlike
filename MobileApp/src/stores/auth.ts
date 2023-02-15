import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import {LoginForm} from '../screens/LoginScreen';
import axiosInstance from '../utils/axiosInstance';
import errorMessage from '../utils/errorMessage';
import {StateLoading} from '../utils/types';
import useArticleStore from './article';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  follower?: number;
  following?: number;
}

interface AuthState {
  user?: User;
  token?: string;
  loginState?: StateLoading<any>;
  refreshTokenState?: StateLoading<any>;
  logoutState?: StateLoading<any>;
}

interface AuthActions {
  login: (params: LoginForm) => Promise<void>;
  refreshToken: () => Promise<string>;
  logout: (hasConfirmation?: boolean) => Promise<void>;
}

type Store = AuthState & AuthActions;

const useAuthStore = create<Store>()(
  devtools(
    persist(
      set => ({
        login: async params => {
          set({loginState: {isLoading: true}});
          try {
            const {data} = await axiosInstance({
              method: 'POST',
              url: '/functions/login',
              data: params,
            });
            set({
              loginState: {isLoading: false},
              user: data?.user,
              token: data?.accessToken,
            });
          } catch (err) {
            set({loginState: {isLoading: false, error: errorMessage(err)}});
          }
        },
        refreshToken: async () => {
          set({refreshTokenState: {isLoading: true}});
          const {data} = await axiosInstance({
            method: 'POST',
            url: '/functions/refresh-token',
          });
          set(() => {
            return {
              refreshTokenState: {isLoading: false},
              user: data?.user,
              token: data?.accessToken,
            };
          });
          return data?.accessToken;
        },
        logout: async (hasConfirmation = true) => {
          const _logout = async () => {
            try {
              set({logoutState: {isLoading: true}});
              await axiosInstance({
                method: 'POST',
                url: '/functions/logout',
              });
              useArticleStore.getState().setArticleState({articleList: {}});
              set({
                logoutState: {isLoading: false},
                user: undefined,
                token: undefined,
              });
            } catch (err) {
              console.log(err);
              set({
                logoutState: {isLoading: false, error: errorMessage(err)},
              });
            }
          };
          if (!hasConfirmation) {
            _logout();
          } else {
            Alert.alert('Confirm', 'Are you sure you want to logout?', [
              {text: 'No'},
              {
                text: 'Yes',
                style: 'destructive',
                onPress: _logout,
              },
            ]);
          }
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        onRehydrateStorage: () => {
          return (state: Store | undefined) => {
            if (state?.token) {
              axiosInstance.defaults.headers.common.Authorization =
                'Bearer ' + state?.token;
            } else {
              delete axiosInstance.defaults.headers.common.Authorization;
            }
          };
        },
      },
    ),
  ),
);

export default useAuthStore;
