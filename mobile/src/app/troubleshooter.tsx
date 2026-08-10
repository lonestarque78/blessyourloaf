import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Pill } from '@/components/ui/pill';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SUGGESTION_KEYS = ['notRising', 'tooSticky', 'ovenSpring'] as const;

export default function TroubleshooterScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScreenScroll>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">{t('troubleshooter.title')}</ThemedText>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('troubleshooter.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.chipRow}>
        {SUGGESTION_KEYS.map((key) => (
          <Pill key={key} label={t(`troubleshooter.suggestions.${key}`)} />
        ))}
      </View>

      <Card>
        <View style={[styles.inputMock, { borderColor: theme.border }]}>
          <ThemedText themeColor="textSecondary">
            {t('troubleshooter.inputPlaceholder')}
          </ThemedText>
        </View>
        <GradientButton label={t('troubleshooter.ask')} disabled />
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  inputMock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
