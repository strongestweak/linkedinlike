import {
  FormControl,
  IInputProps,
  Input,
  Stack,
  View,
  WarningOutlineIcon,
} from 'native-base';
import React, {FunctionComponent} from 'react';
import Animated, {FadeInDown, FadeOutDown} from 'react-native-reanimated';

/**
 * TextInput props
 */
interface Props extends IInputProps {
  label: string;
  error?: string;
  isRequired?: boolean;
}

/**
 * TextInput Component
 */
const TextInput: FunctionComponent<Props> = ({
  label,
  error,
  isRequired,
  ...props
}) => {
  return (
    <>
      <FormControl isRequired={isRequired} isInvalid={Boolean(error)}>
        <Stack mx="4">
          <FormControl.Label>{label}</FormControl.Label>
          <Input type="text" placeholder={label} {...props} />
          {error ? (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
              <FormControl.ErrorMessage
                leftIcon={<WarningOutlineIcon size="xs" />}>
                {error}
              </FormControl.ErrorMessage>
            </Animated.View>
          ) : (
            <View />
          )}
        </Stack>
      </FormControl>
    </>
  );
};

export default TextInput;
