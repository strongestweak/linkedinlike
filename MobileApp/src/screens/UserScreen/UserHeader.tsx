import {Image, Text, useTheme, View} from 'native-base';
import React, {FunctionComponent, useCallback, useEffect, useMemo} from 'react';
import {TouchableOpacity} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import useAuthStore, {User} from '../../stores/auth';
import useFollowStore, {UserFollow} from '../../stores/follow';
import useUserStore from '../../stores/user';
import {ROUTES, StateLoading, useNavigation} from '../../utils/types';
import {FollowType} from '../FollowScreen';

/**
 * UserHeader props
 */
interface Props {
  user: User;
}

/**
 * UserHeader Component
 */
const UserHeader: FunctionComponent<Props> = ({user: userParam, ...props}) => {
  const {fetchUser, userList} = useUserStore();
  const theme = useTheme();
  const {
    fetchUserFollow,
    createFollow,
    deleteFollow,
    createdFollow,
    userFollow,
  } = useFollowStore();
  const {user: cUser} = useAuthStore();
  const navigation = useNavigation();

  const user = useMemo<User>(() => {
    return userList[userParam.id]?.data || userParam;
  }, [userList, userParam]);

  const userFollowState = useMemo<StateLoading<UserFollow>>(() => {
    if (cUser?.id) {
      return userFollow[cUser?.id + '-' + user.id];
    }
    return {};
  }, [cUser?.id, user.id, userFollow]);

  useEffect(() => {
    if (cUser?.id && user?.id) {
      fetchUserFollow(cUser?.id, user?.id);
    }
  }, [cUser?.id, fetchUserFollow, user.id]);

  useEffect(() => {
    (async () => {
      await fetchUser(user.id, {scope: 'with-follower'});
      await fetchUser(user.id, {scope: 'with-following'});
    })();
  }, [fetchUser, user.id]);

  const getUserDetail = useCallback(
    (key: keyof User) => {
      const state = userList[userParam.id];
      const isUndefined = typeof user[key] === 'undefined';
      if (isUndefined && state?.isLoading) {
        return 'Loading';
      }
      return isUndefined ? '-' : user[key];
    },
    [user, userList, userParam.id],
  );

  const gotoFollowScreen = (type: FollowType) => {
    navigation.push(ROUTES.FollowScreen, {type, user});
  };

  const disabledFollowBtn = useMemo(
    () => userFollowState?.isLoading || createdFollow[user?.id]?.isLoading,
    [createdFollow, user?.id, userFollowState?.isLoading],
  );

  const followBtnColor = useMemo(() => {
    const {colors} = theme;
    if (disabledFollowBtn) {
      return colors.coolGray[900];
    }
    if (userFollowState?.data) {
      return colors.red[500];
    }
    return colors.primary[500];
  }, [disabledFollowBtn, theme, userFollowState?.data]);

  const followBtnLabel = useMemo(() => {
    if (disabledFollowBtn) {
      return 'Loading';
    }
    if (userFollowState?.data) {
      return 'Unfollow';
    }
    return 'Follow';
  }, [disabledFollowBtn, userFollowState?.data]);

  const onPressFollow = useCallback(() => {
    if (userFollowState?.data) {
      deleteFollow(userFollowState?.data);
    } else {
      createFollow(user.id);
    }
  }, [createFollow, deleteFollow, user.id, userFollowState?.data]);

  return (
    <Animated.View entering={FadeInDown.delay(300)} exiting={FadeOutDown}>
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        padding={5}>
        <Animated.View entering={ZoomIn.delay(200)}>
          <Image
            source={{uri: user?.avatar}}
            alt=""
            resizeMode="cover"
            style={{width: 100, height: 100, borderRadius: 100}}
            backgroundColor="coolGray.900"
          />
        </Animated.View>
        <Text fontSize="lg" marginTop={3}>
          {user.firstName} {user.lastName}
        </Text>
        <Text fontSize="sm">{user.email}</Text>
        {cUser?.id !== user?.id ? (
          <Animated.View entering={ZoomIn.delay(300)} exiting={ZoomOut}>
            <TouchableOpacity
              disabled={disabledFollowBtn}
              onPress={onPressFollow}>
              <View
                style={{padding: 5, opacity: disabledFollowBtn ? 0.25 : 1}}
                backgroundColor={followBtnColor}
                marginTop={3}>
                <Text>{followBtnLabel}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        <View style={{flexDirection: 'row'}} marginTop={5}>
          <TouchableOpacity
            onPress={() => gotoFollowScreen(FollowType.follower)}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text fontSize="md">Followers</Text>
            <Text fontSize="md">{getUserDetail('follower')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => gotoFollowScreen(FollowType.following)}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text fontSize="md">Following</Text>
            <Text fontSize="md">{getUserDetail('following')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Animated.View entering={FadeInDown.delay(600)} style={{paddingLeft: 5}}>
        <Text>Articles</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default UserHeader;
