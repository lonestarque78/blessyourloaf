import { StyleSheet, Text, View, type ColorValue } from 'react-native';

import { Spacing } from '@/constants/theme';

type IconChipProps = {
  emoji: string;
  backgroundColor: ColorValue;
};

export function IconChip({ emoji, backgroundColor }: IconChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 40,
    height: 40,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
});
