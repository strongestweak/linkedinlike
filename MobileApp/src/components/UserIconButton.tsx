import {Box, Menu, Pressable} from 'native-base';
import React, {FunctionComponent, useCallback} from 'react';
import {ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useAuthStore from '../stores/auth';
import {ROUTES, useNavigation} from '../utils/types';

/**
 * UserIconButton props
 */
interface Props {
  tintColor?: string;
}

/**
 * UserIconButton Component
 */
const UserIconButton: FunctionComponent<Props> = ({tintColor, ...props}) => {
  const {logout, logoutState, user} = useAuthStore();
  const navigation = useNavigation();

  const onPressProfile = useCallback(() => {
    if (user) {
      navigation.navigate(ROUTES.UserScreen, {user});
    }
  }, [navigation, user]);

  if (logoutState?.isLoading) {
    return <ActivityIndicator color={tintColor} />;
  }
  return (
    <Box>
      <Menu
        w="190"
        marginRight={2}
        trigger={triggerProps => {
          return (
            <Pressable accessibilityLabel="More options menu" {...triggerProps}>
              <Icon name="account-circle" color={tintColor} size={20} />
            </Pressable>
          );
        }}>
        <Menu.Item onPress={onPressProfile}>Profile</Menu.Item>
        <Menu.Item onPress={() => logout()}>Logout</Menu.Item>
      </Menu>
    </Box>
  );
};

export default UserIconButton;
