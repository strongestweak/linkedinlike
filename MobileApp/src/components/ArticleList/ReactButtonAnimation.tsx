import React, {FunctionComponent, useCallback} from 'react';
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  RollInRight,
  RotateInDownLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * ReactButtonAnimation props
 */
interface Props extends TouchableOpacityProps {
  angle?: number;
}

/**
 * ReactButtonAnimation Component
 */
const ReactButtonAnimation: FunctionComponent<Props> = ({
  children,
  angle = 10,
  ...props
}) => {
  const animationValue = useSharedValue(0);
  const onPress = useCallback(
    (event: GestureResponderEvent) => {
      animationValue.value = withSequence(
        withTiming(-10, {duration: 50}),
        withRepeat(withTiming(angle, {duration: 100}), 6, true),
        withTiming(0, {duration: 50}),
      );
      if (props.onPress) {
        props.onPress(event);
      }
    },
    [angle, animationValue, props],
  );

  const cStyle = useAnimatedStyle(() => {
    return {transform: [{rotate: animationValue.value + 'deg'}]};
  }, []);

  return (
    <TouchableOpacity {...props} onPress={onPress}>
      <Animated.View
        entering={RotateInDownLeft.delay(300).springify()}
        style={cStyle}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ReactButtonAnimation;
