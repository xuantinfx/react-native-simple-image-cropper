import Animated, { add } from 'react-native-reanimated';

const {
  Clock,
  Value,
  block,
  cond,
  stopClock,
  set,
  startClock,
  clockRunning,
  not,
  timing: reTiming,
} = Animated;

interface TimingAnimation {
  state: Animated.TimingState;
  config: Animated.TimingConfig;
}

interface AnimateParams<S, C> {
  clock: Animated.Clock;
  fn: (
    clock: Animated.Clock,
    state: S,
    config: C,
  ) => Animated.Adaptable<number>;
  state: S;
  config: C;
  from: Animated.Adaptable<number>;
}

interface TimingAnimation {
  state: Animated.TimingState;
  config: Animated.TimingConfig;
}

type Animation = TimingAnimation;

const animate = <T extends Animation>({
  fn,
  clock,
  state,
  config,
  from,
}: AnimateParams<T['state'], T['config']>) =>
  block([
    cond(not(clockRunning(clock)), [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, from),
      startClock(clock),
    ]),
    fn(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ]);

export interface TimingParams {
  clock?: Animated.Clock;
  from?: Animated.Adaptable<number>;
  to?: Animated.Adaptable<number>;
  duration?: Animated.Adaptable<number>;
  easing?: (v: Animated.Adaptable<number>) => Animated.Node<number>;
}

export const timing = (params: TimingParams) => {
  const { clock, easing, duration, from, to } = {
    clock: new Clock(),
    duration: 250,
    from: 0,
    to: 1,
    easing: (v: Animated.Adaptable<number>) => add(v, 0),
    ...params,
  };

  const state: Animated.TimingState = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    toValue: new Value(0),
    duration,
    easing,
  };

  return block([
    cond(not(clockRunning(clock)), [
      set(config.toValue, to),
      set(state.frameTime, 0),
    ]),
    animate<TimingAnimation>({
      clock,
      fn: reTiming,
      state,
      config,
      from,
    }),
  ]);
};