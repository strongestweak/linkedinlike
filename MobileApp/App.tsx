import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {extendTheme, NativeBaseProvider, StatusBar} from 'native-base';
import React, {FunctionComponent, useCallback} from 'react';
import {LogBox} from 'react-native';
import colors from 'material-colors';
import UserIconButton from './src/components/UserIconButton';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import useAuthStore from './src/stores/auth';
import {ROUTES} from './src/utils/types';
import {HeaderButtonProps} from '@react-navigation/native-stack/lib/typescript/src/types';
import ArticleScreen from './src/screens/ArticleScreen';
import UserScreen from './src/screens/UserScreen';
import FollowScreen from './src/screens/FollowScreen';

/**
 * App props
 */
interface Props {}

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs(['Require cycle:']);

/**
 * App Component
 */
const App: FunctionComponent<Props> = ({...props}) => {
  const {user, token, logoutState} = useAuthStore();

  const theme = extendTheme({
    colors: {
      primary: colors.lightBlue,
    },
    config: {
      initialColorMode: 'dark',
    },
  });

  const homeHeaderRight = useCallback(
    ({tintColor}: HeaderButtonProps) => {
      return <UserIconButton tintColor={tintColor} />;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logoutState?.isLoading],
  );

  return (
    <NativeBaseProvider theme={theme}>
      <StatusBar barStyle={'light-content'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            contentStyle: {backgroundColor: theme.colors.coolGray[800]},
            headerStyle: {backgroundColor: theme.colors.coolGray[900]},
            headerTintColor: 'white',
          }}>
          {user && token ? (
            <>
              <Stack.Screen
                name={ROUTES.HomeScreen}
                component={HomeScreen}
                options={{
                  title: 'Home',
                  headerRight: homeHeaderRight,
                }}
              />
              <Stack.Screen
                name={ROUTES.ArticleScreen}
                component={ArticleScreen}
                options={{
                  title: 'Article',
                }}
              />
              <Stack.Screen
                name={ROUTES.UserScreen}
                component={UserScreen}
                options={{
                  title: 'User',
                }}
              />
              <Stack.Screen
                name={ROUTES.FollowScreen}
                component={FollowScreen}
                options={{
                  title: 'Follow',
                }}
              />
            </>
          ) : (
            <Stack.Screen
              name={ROUTES.LoginScreen}
              component={LoginScreen}
              options={{headerShown: false}}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
