import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeScreenParams} from '../screens/HomeScreen';
import {LoginScreenParams} from '../screens/LoginScreen';
import {useNavigation as useNavigationLib} from '@react-navigation/native';
import {ArticleScreenParams} from '../screens/ArticleScreen';
import {UserScreenParams} from '../screens/UserScreen';
import {FollowScreenParams} from '../screens/FollowScreen';

export interface StateLoading<Type> {
  isLoading?: boolean;
  error?: string;
  data?: Type;
}

export interface StateLoadingPagination<Type> extends StateLoading<Type> {
  pagination?: Pagination;
}

export enum ROUTES {
  HomeScreen = 'HomeScreen',
  LoginScreen = 'LoginScreen',
  ArticleScreen = 'ArticleScreen',
  UserScreen = 'UserScreen',
  FollowScreen = 'FollowScreen',
}

export type RootStackParamList = {
  [ROUTES.HomeScreen]: HomeScreenParams;
  [ROUTES.LoginScreen]: LoginScreenParams;
  [ROUTES.ArticleScreen]: ArticleScreenParams;
  [ROUTES.UserScreen]: UserScreenParams;
  [ROUTES.FollowScreen]: FollowScreenParams;
};

export const useNavigation = () =>
  useNavigationLib<NativeStackNavigationProp<RootStackParamList>>();

export interface Pagination {
  total: number;
  offset: number;
  count: number;
}
