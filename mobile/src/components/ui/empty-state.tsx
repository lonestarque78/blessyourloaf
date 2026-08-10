import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type EmptyStateProps = {
  emoji: string;
  message: string;
  children?: ReactNode;
};

export function EmptyState({ emoji, message, children }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="italic" themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  emoji: {
    fontSize: 40,
  },
  message: {
    textAlign: 'center',
  },
});
