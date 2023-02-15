import AsyncStorage from '@react-native-async-storage/async-storage';
import {AxiosHeaders} from 'axios';
import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import axiosInstance, {getHeaderPagination} from '../utils/axiosInstance';
import errorMessage from '../utils/errorMessage';
import {StateLoading, StateLoadingPagination} from '../utils/types';
import useAuthStore, {User} from './auth';

export type ReactType = 'like' | 'unlike';

export interface ArticleUserReact {
  type: ReactType;
  count: number;
  ArticleId?: number;
  UserId?: number;
  id: number;
}

export interface Article {
  id: number;
  title: string;
  UserId: number;
  datePublished: Date;
  description: string;
  thumbnail: string;
  User: User;
  ArticleUserReact: ArticleUserReact[];
}

interface ArticleStates {
  articleList: Record<string, StateLoadingPagination<Article[]>>;
  article: Record<string, StateLoadingPagination<Article>>;
  userReact: Record<string, StateLoading<ArticleUserReact>>;
  updateReactState: Record<string, StateLoading<ArticleUserReact>>;
}
interface ArticleActions {
  fetchArticleItem: (articleId: number) => Promise<Article | void>;
  fetchArticle: (params: {
    userId: number | undefined;
    ignoreLoading?: boolean;
    offset?: number;
    count?: number;
  }) => Promise<Article[] | void>;
  setArticleState: (state: Partial<ArticleStates>) => void;
  fetchUserReact: (articleId: number) => Promise<ArticleUserReact | void>;
  updateReact: (
    articleId: number,
    type: ReactType,
    userReactId?: number,
    isDelete?: boolean,
  ) => Promise<ArticleUserReact | void>;
}

const useArticleStore = create<ArticleStates & ArticleActions>()(
  devtools(
    persist(
      (set, get) => ({
        articleList: {},
        article: {},
        userReact: {},
        updateReactState: {},
        fetchArticleItem: async articleId => {
          const updateArticle = (data: StateLoadingPagination<Article>) => {
            set(state => {
              const cData = state.article[articleId] || {};
              if (data.data) {
                data.data = {...(cData || {}), ...(data.data || {})};
              }
              return {
                ...state,
                article: {...state.article, [articleId]: {...cData, ...data}},
              };
            });
          };
          updateArticle({isLoading: true});
          try {
            const {data} = await axiosInstance({
              url: '/rest/Article/' + articleId,
              params: {
                scope: 'with-react',
                include: 'User',
              },
            });
            updateArticle({isLoading: false, data});
            return data as Article;
          } catch (err) {
            console.log('ERR', errorMessage(err));
            updateArticle({isLoading: false, error: errorMessage(err)});
          }
        },
        fetchArticle: async ({
          userId,
          ignoreLoading,
          offset = 0,
          count = 20,
        }) => {
          const key = userId || 'All';
          const updateArticleList = (
            data: StateLoadingPagination<Article[]>,
            shouldAppend?: boolean,
          ) => {
            set(state => {
              const cData = state.articleList[key] || {};
              if (shouldAppend) {
                data.data = [...(cData.data || []), ...(data.data || [])];
              }
              return {
                ...state,
                articleList: {...state.articleList, [key]: {...cData, ...data}},
              };
            });
          };
          try {
            const cState = get().articleList[key];
            if (!ignoreLoading) {
              if (cState.isLoading) {
                return;
              }
            }
            updateArticleList({isLoading: true});
            const {data, headers} = await axiosInstance({
              url: '/rest/Article',
              method: 'GET',
              params: {
                UserId: userId,
                include: 'User',
                sort: '-datePublished',
                scope: 'with-react',
                count,
                offset,
              },
            });
            const pagination = getHeaderPagination(headers as AxiosHeaders);
            updateArticleList(
              {
                isLoading: false,
                data,
                pagination,
              },
              pagination.offset !== 0,
            );
            return data as Article[];
          } catch (err) {
            updateArticleList({isLoading: false, error: errorMessage(err)});
          }
        },
        setArticleState: state => set({...state}),
        fetchUserReact: async articleId => {
          const updateUserReact = (
            data: StateLoadingPagination<ArticleUserReact>,
          ) => {
            set(state => {
              return {
                userReact: {
                  ...state.userReact,
                  [articleId]: data,
                },
              };
            });
          };

          updateUserReact({isLoading: true});
          try {
            const cUser = useAuthStore.getState().user as User;
            const {data} = await axiosInstance({
              url: '/rest/ArticleUserReact',
              params: {
                ArticleId: articleId,
                UserId: cUser.id,
              },
            });
            const firstItem = (data || [])[0];
            updateUserReact({isLoading: false, data: firstItem});
            return data as ArticleUserReact;
          } catch (err) {
            updateUserReact({isLoading: false, error: errorMessage(err)});
          }
        },
        updateReact: async (articleId, type, userReact, isDelete) => {
          const updateReactState = (data: StateLoading<ArticleUserReact>) => {
            set(state => {
              return {
                updateReactState: {
                  ...state.updateReactState,
                  [articleId]: data,
                },
              };
            });
          };
          updateReactState({isLoading: true});
          try {
            const cUser = useAuthStore.getState().user as User;
            const method = isDelete ? 'DELETE' : userReact ? 'PUT' : 'POST';
            const {data} = await axiosInstance({
              method,
              url: '/rest/ArticleUserReact/' + (userReact || ''),
              data: {
                ArticleId: articleId,
                UserId: cUser.id,
                type: type,
              },
            });
            await get().fetchArticleItem(articleId);
            await get().fetchUserReact(articleId);
            updateReactState({isLoading: false});
            return data as ArticleUserReact;
          } catch (err) {
            console.log('error', errorMessage(err));
            updateReactState({isLoading: false, error: errorMessage(err)});
          }
        },
      }),
      {
        name: 'article',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  ),
);

export default useArticleStore;
