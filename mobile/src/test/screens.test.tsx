import { screen } from '@testing-library/react-native';
import i18next from '@/i18n';
import { renderScreen } from '@/test/render-screen';

import HomeScreen from '@/app/index';
import StartersScreen from '@/app/starters';
import BakeScreen from '@/app/bake';
import RecipesScreen from '@/app/recipes';
import TroubleshooterScreen from '@/app/troubleshooter';

afterEach(async () => {
  await i18next.changeLanguage('en');
});

describe('HomeScreen', () => {
  it('renders in English by default', () => {
    renderScreen(<HomeScreen />);
    expect(screen.getByText('Starter Journal')).toBeTruthy();
    expect(screen.getByText('Open Starter Journal →')).toBeTruthy();
  });

  it('renders in Spanish when the language is switched', async () => {
    await i18next.changeLanguage('es');
    renderScreen(<HomeScreen />);
    expect(screen.getByText('Diario de la masa madre')).toBeTruthy();
    expect(screen.getByText('Abrir el diario de la masa madre →')).toBeTruthy();
  });
});

describe('StartersScreen', () => {
  it('renders in English by default', () => {
    renderScreen(<StartersScreen />);
    expect(screen.getByText('Your Starters')).toBeTruthy();
    expect(screen.getByText('Create My First Starter')).toBeTruthy();
  });

  it('renders in Spanish when the language is switched', async () => {
    await i18next.changeLanguage('es');
    renderScreen(<StartersScreen />);
    expect(screen.getByText('Tus masas madre')).toBeTruthy();
    expect(screen.getByText('Crear mi primera masa madre')).toBeTruthy();
  });
});

describe('BakeScreen', () => {
  it('renders in English by default', () => {
    renderScreen(<BakeScreen />);
    expect(screen.getByText('Bake Scheduler')).toBeTruthy();
    expect(screen.getByText('Schedule a Bake')).toBeTruthy();
  });

  it('renders in Spanish when the language is switched', async () => {
    await i18next.changeLanguage('es');
    renderScreen(<BakeScreen />);
    expect(screen.getByText('Planificador de horneado')).toBeTruthy();
    expect(screen.getByText('Planificar un horneado')).toBeTruthy();
  });
});

describe('RecipesScreen', () => {
  it('renders in English by default', () => {
    renderScreen(<RecipesScreen />);
    expect(screen.getByText('Recipe Library')).toBeTruthy();
    expect(screen.getByText('Discard')).toBeTruthy();
  });

  it('renders in Spanish when the language is switched', async () => {
    await i18next.changeLanguage('es');
    renderScreen(<RecipesScreen />);
    expect(screen.getByText('Biblioteca de recetas')).toBeTruthy();
    expect(screen.getByText('Descarte')).toBeTruthy();
  });
});

describe('TroubleshooterScreen', () => {
  it('renders in English by default', () => {
    renderScreen(<TroubleshooterScreen />);
    expect(screen.getByText('Troubleshooter')).toBeTruthy();
    expect(screen.getByText("My starter isn't rising")).toBeTruthy();
  });

  it('renders in Spanish when the language is switched', async () => {
    await i18next.changeLanguage('es');
    renderScreen(<TroubleshooterScreen />);
    expect(screen.getByText('Solucionador de problemas')).toBeTruthy();
    expect(screen.getByText('Mi masa madre no sube')).toBeTruthy();
  });
});
