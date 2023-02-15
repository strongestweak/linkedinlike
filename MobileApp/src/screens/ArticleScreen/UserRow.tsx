import {Image, Text, View} from 'native-base';
import React, {FunctionComponent, useEffect, useMemo} from 'react';
import Animated, {ZoomIn, ZoomOut} from 'react-native-reanimated';
import {User} from '../../stores/auth';
import useUserStore from '../../stores/user';

/**
 * UserRow props
 */
interface Props {
  user: User;
}

/**
 * UserRow Component
 */
const UserRow: FunctionComponent<Props> = ({user, ...props}) => {
  const {userList, fetchUser} = useUserStore();
  const userState = useMemo(() => userList[user.id], [user.id, userList]);

  const renderFollower = useMemo(() => {
    if (userState?.isLoading && !userState.data) {
      return 'Loading';
    }
    return userState?.data?.follower || 0;
  }, [userState?.data, userState?.isLoading]);

  useEffect(() => {
    fetchUser(user.id);
  }, [fetchUser, user]);

  return (
    <View style={{flexDirection: 'row'}} marginTop={1}>
      <Animated.View
        entering={ZoomIn.delay(200).duration(200)}
        exiting={ZoomOut}>
        <Image
          source={{uri: user?.avatar}}
          alt={user?.email}
          style={{width: 50, height: 50, borderRadius: 50}}
          marginRight={3}
          backgroundColor={'coolGray.900'}
        />
      </Animated.View>
      <View>
        <Text>{`${user?.firstName} ${user?.lastName}`}</Text>
        <Text>{`Followers ${renderFollower}`}</Text>
      </View>
    </View>
  );
};

export default UserRow;
