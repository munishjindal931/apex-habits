import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const PARTICLE_COUNT = 10;
const COLORS = ['#FF9500', '#FF3B30', '#34C759', '#007AFF', '#AF52DE', '#FFCC00'];

export type CelebrationKind = 'habit' | 'challenge' | null;

type Props = {
  kind: CelebrationKind;
  label?: string;
  onDone: () => void;
};

export function CelebrationOverlay({ kind, label, onDone }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      color: COLORS[i % COLORS.length],
    }))
  ).current;

  useEffect(() => {
    if (!kind) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: kind === 'challenge' ? 1100 : 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [kind]);

  if (!kind) return null;

  const radius = kind === 'challenge' ? 90 : 60;
  const scale = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1.25, 1] });
  const badgeOpacity = progress.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.center}>
        {particles.map((p, i) => {
          const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * radius] });
          const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.angle) * radius] });
          const opacity = progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });
          return (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                { backgroundColor: p.color, opacity, transform: [{ translateX }, { translateY }] },
              ]}
            />
          );
        })}
        <Animated.View style={[styles.badge, { transform: [{ scale }], opacity: badgeOpacity }]}>
          <Text style={styles.badgeText}>{kind === 'challenge' ? '🏆' : '✓'}</Text>
        </Animated.View>
        {label ? <Animated.Text style={[styles.label, { opacity: badgeOpacity }]}>{label}</Animated.Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  badgeText: {
    fontSize: 32,
  },
  label: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    backgroundColor: '#FFFFFFEE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
