import {
  Box,
  Button,
  KeyboardAvoidingView,
  Stack,
  Text,
  View,
} from 'native-base';
import React, {FunctionComponent, useCallback, useState} from 'react';
import Config from 'react-native-config';
import Animated, {FadeInDown} from 'react-native-reanimated';
import TextInput from '../../components/TextInput';
import useAuthStore from '../../stores/auth';

export interface LoginScreenParams {}

export interface LoginForm {
  email: string;
  password: string;
}

/**
 * LoginScreen props
 */
interface LoginScreenProps {
  routes?: {params: LoginScreenParams};
}

/**
 * LoginScreen Component
 */
const LoginScreen: FunctionComponent<LoginScreenProps> = () => {
  const {login, loginState} = useAuthStore();
  const [data, setData] = useState<LoginForm>({
    email: __DEV__ ? Config.TEST_EMAIL || '' : '',
    password: __DEV__ ? Config.TEST_PASSWORD || '' : '',
  });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});

  const onSubmit = useCallback(() => {
    const cErrors: Partial<LoginForm> = {};
    setErrors({});
    if (!data.email) {
      cErrors.email = 'This field is required.';
    }
    if (!data.password) {
      cErrors.password = 'This field is required.';
    }
    setErrors(cErrors);
    if (Object.keys(cErrors).length > 0) {
      return;
    }
    login(data);
  }, [data, login]);

  return (
    <>
      <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Animated.View entering={FadeInDown}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>InLinked</Text>
          </Animated.View>
          <Box w="100%" maxWidth="300px" marginTop={5}>
            <Animated.View entering={FadeInDown.delay(100)}>
              <TextInput
                label="Email"
                autoCapitalize="none"
                inputMode="email"
                value={data.email}
                onChangeText={email => setData(val => ({...val, email}))}
                error={errors.email}
                isRequired
              />
            </Animated.View>
          </Box>
          <Box w="100%" maxWidth="300px" marginTop={2}>
            <Animated.View entering={FadeInDown.delay(200)}>
              <TextInput
                label="Password"
                type="password"
                value={data.password}
                onChangeText={password => setData(val => ({...val, password}))}
                error={errors.password}
                isRequired
              />
            </Animated.View>
          </Box>
          <Box w="100%" maxWidth="300px" marginTop={3}>
            <Animated.View entering={FadeInDown.delay(300)}>
              <Stack mx="4">
                <Button isLoading={loginState?.isLoading} onPress={onSubmit}>
                  <Text>Login</Text>
                </Button>
              </Stack>
            </Animated.View>
          </Box>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;
