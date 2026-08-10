import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconChip } from '@/components/ui/icon-chip';
import { Pill } from '@/components/ui/pill';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionColors, Spacing } from '@/constants/theme';

function useGreeting(t: (key: string) => string) {
  const hour = new Date().getHours();
  if (hour < 12) return t('home.greetingMorning');
  if (hour < 17) return t('home.greetingAfternoon');
  return t('home.greetingEvening');
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const greeting = useGreeting(t);

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <ThemedText type="title">
          {t('home.greetingName', { greeting })}
        </ThemedText>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('home.subtitle')}
        </ThemedText>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <IconChip emoji="🫙" backgroundColor={SectionColors.starter} />
          <ThemedText type="subtitle">{t('home.starterJournalTitle')}</ThemedText>
        </View>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('home.starterJournalDesc')}
        </ThemedText>
        <Link href="/starters" asChild>
          <ThemedText type="linkPrimary">{t('home.starterJournalCta')}</ThemedText>
        </Link>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <IconChip emoji="📅" backgroundColor={SectionColors.bake} />
          <ThemedText type="subtitle">{t('home.bakeSchedulerTitle')}</ThemedText>
        </View>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('home.bakeSchedulerDesc')}
        </ThemedText>
        <Link href="/bake" asChild>
          <ThemedText type="linkPrimary">{t('home.bakeSchedulerCta')}</ThemedText>
        </Link>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <IconChip emoji="📖" backgroundColor={SectionColors.recipes} />
          <ThemedText type="subtitle">{t('home.recipeLibraryTitle')}</ThemedText>
        </View>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('home.recipeLibraryDesc')}
        </ThemedText>
        <Link href="/recipes" asChild>
          <ThemedText type="linkPrimary">{t('home.recipeLibraryCta')}</ThemedText>
        </Link>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <IconChip emoji="🗄️" backgroundColor={SectionColors.discard} />
          <ThemedText type="subtitle">{t('home.discardVaultTitle')}</ThemedText>
        </View>
        <ThemedText type="italic" themeColor="textSecondary">
          {t('home.discardVaultDesc')}
        </ThemedText>
        <Pill label={t('home.comingSoon')} />
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
