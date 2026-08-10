import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Pill } from '@/components/ui/pill';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Spacing } from '@/constants/theme';

const CATEGORY_KEYS = ['loaves', 'rolls', 'focaccia', 'discard'] as const;

export default function RecipesScreen() {
  const { t } = useTranslation();

  return (
    <ScreenScroll>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">{t('recipes.title')}</ThemedText>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('recipes.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.categoryRow}>
        {CATEGORY_KEYS.map((key) => (
          <Pill key={key} label={t(`recipes.categories.${key}`)} />
        ))}
      </View>

      <EmptyState
        emoji="📖"
        message={t('recipes.emptyMessage')}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
