import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { GradientButton } from '@/components/ui/gradient-button';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Spacing } from '@/constants/theme';

export default function BakeScreen() {
  const { t } = useTranslation();

  return (
    <ScreenScroll>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">{t('bake.title')}</ThemedText>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('bake.subtitle')}
        </ThemedText>
      </View>

      <EmptyState
        emoji="📅"
        message={t('bake.emptyMessage')}>
        <GradientButton label={t('bake.scheduleABake')} disabled />
      </EmptyState>
    </ScreenScroll>
  );
}
