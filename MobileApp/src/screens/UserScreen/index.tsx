import {RouteProp, useRoute} from '@react-navigation/native';
import React, {FunctionComponent, useEffect} from 'react';
import ArticleList from '../../components/ArticleList';
import {User} from '../../stores/auth';
import {RootStackParamList, ROUTES, useNavigation} from '../../utils/types';
import UserHeader from './UserHeader';

export interface UserScreenParams {
  user: User;
}

type UserRouteProp = RouteProp<RootStackParamList, ROUTES.UserScreen>;

/**
 * UserScreen props
 */
interface UserScreenProps {
  routes?: {params: UserScreenParams};
}

/**
 * UserScreen Component
 */
const UserScreen: FunctionComponent<UserScreenProps> = () => {
  const {user} = useRoute<UserRouteProp>().params;
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: user.firstName + ' ' + user.lastName,
    });
  }, [navigation, user]);

  return (
    <ArticleList ListHeaderComponent={<UserHeader user={user} />} user={user} />
  );
};

export default UserScreen;
