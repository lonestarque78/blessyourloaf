import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { GradientButton } from '@/components/ui/gradient-button';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Spacing } from '@/constants/theme';

export default function StartersScreen() {
  const { t } = useTranslation();

  return (
    <ScreenScroll>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">{t('starters.title')}</ThemedText>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('starters.subtitle')}
        </ThemedText>
      </View>

      <EmptyState
        emoji="🫙"
        message={t('starters.emptyMessage')}>
        <GradientButton label={t('starters.createFirst')} disabled />
      </EmptyState>
    </ScreenScroll>
  );
}
