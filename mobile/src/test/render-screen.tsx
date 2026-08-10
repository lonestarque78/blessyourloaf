import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// Every screen goes through ScreenScroll, which reads safe-area insets — real device/simulator
// values aren't available under Jest, so tests provide fixed ones via SafeAreaProvider.
export function renderScreen(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={TEST_METRICS}>{ui}</SafeAreaProvider>);
}
