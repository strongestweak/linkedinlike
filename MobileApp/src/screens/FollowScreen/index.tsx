import {RouteProp, useRoute} from '@react-navigation/native';
import {FlatList} from 'native-base';
import React, {FunctionComponent, useCallback, useEffect, useMemo} from 'react';
import {ListRenderItem, TouchableOpacity} from 'react-native';
import {User} from '../../stores/auth';
import useFollowStore, {UserFollow} from '../../stores/follow';
import {RootStackParamList, ROUTES, useNavigation} from '../../utils/types';
import UserRow from '../ArticleScreen/UserRow';

export enum FollowType {
  follower = 'follower',
  following = 'following',
}

export interface FollowScreenParams {
  type: FollowType;
  user: User;
}
type FollowRouteProp = RouteProp<RootStackParamList, ROUTES.FollowScreen>;

/**
 * FollowScreen props
 */
interface FollowScreenProps {
  routes?: {params: FollowScreenParams};
}

/**
 * FollowScreen Component
 */
const FollowScreen: FunctionComponent<FollowScreenProps> = () => {
  const {fetchUserFollowList, follower, following} = useFollowStore();
  const {type, user} = useRoute<FollowRouteProp>().params;
  const navigation = useNavigation();

  const state = useMemo(() => {
    if (type === FollowType.follower) {
      return follower[user.id];
    }
    return following[user.id];
  }, [follower, following, type, user.id]);

  useEffect(() => {
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    navigation.setOptions({title});
  }, [navigation, type]);

  useEffect(() => {
    fetchUserFollowList(type, user.id);
  }, [fetchUserFollowList, type, user.id]);

  const renderItem = useCallback<ListRenderItem<UserFollow>>(
    ({item}) => {
      let user = item.User;
      if (type === FollowType.following) {
        user = item.Follow;
      }
      if (user) {
        return (
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              if (user) {
                navigation.push(ROUTES.UserScreen, {user});
              }
            }}>
            <UserRow user={user} />
          </TouchableOpacity>
        );
      }
      return null;
    },
    [navigation, type],
  );

  const keyExtractor = useCallback(
    (item: UserFollow, index: number): string => {
      return item.id + '-' + index;
    },
    [],
  );

  return (
    <FlatList
      keyExtractor={keyExtractor}
      data={state?.data || []}
      renderItem={renderItem}
    />
  );
};

export default FollowScreen;
