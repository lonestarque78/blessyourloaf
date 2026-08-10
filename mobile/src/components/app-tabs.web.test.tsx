import i18next from '@/i18n';

// AppTabs (web) renders expo-router/ui's <Tabs>, which requires a full file-based route
// tree to mount ("No filename found" from expo-router's Route context) — not available when
// unit-testing this component in isolation outside the actual app directory. The 5 screens
// themselves (screens.test.tsx) already prove the underlying i18n wiring renders correctly;
// this test covers the tab labels specifically at the data level instead.
describe('tab labels', () => {
  it('resolve to English by default', () => {
    const t = i18next.getFixedT('en');
    expect(t('tabs.home')).toBe('Home');
    expect(t('tabs.starters')).toBe('Starters');
    expect(t('tabs.bake')).toBe('Bake');
    expect(t('tabs.recipes')).toBe('Recipes');
    expect(t('tabs.ask')).toBe('Ask');
  });

  it('resolve to Spanish when the language is switched', () => {
    const t = i18next.getFixedT('es');
    expect(t('tabs.home')).toBe('Inicio');
    expect(t('tabs.starters')).toBe('Masas madre');
    expect(t('tabs.bake')).toBe('Hornear');
    expect(t('tabs.recipes')).toBe('Recetas');
    expect(t('tabs.ask')).toBe('Preguntar');
  });
});
