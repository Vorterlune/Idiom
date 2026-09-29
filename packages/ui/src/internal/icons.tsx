import { Icon } from '@expo/ui';
import { I18nManager, type ColorValue } from 'react-native';

import type { SemanticIcon } from '../types';
import { decorativeIconModifiers } from './iconModifiers';

const icons = {
  person: Icon.select({ ios: 'person.fill', android: import('@expo/material-symbols/person.xml') }),
  notifications: Icon.select({
    ios: 'bell.fill',
    android: import('@expo/material-symbols/notifications.xml'),
  }),
  appearance: Icon.select({
    ios: 'circle.lefthalf.filled',
    android: import('@expo/material-symbols/dark_mode.xml'),
  }),
  sound: Icon.select({
    ios: 'speaker.wave.2.fill',
    android: import('@expo/material-symbols/volume_up.xml'),
  }),
  privacy: Icon.select({
    ios: 'hand.raised.fill',
    android: import('@expo/material-symbols/privacy_tip.xml'),
  }),
  info: Icon.select({ ios: 'info.circle', android: import('@expo/material-symbols/info.xml') }),
  document: Icon.select({
    ios: 'doc.text',
    android: import('@expo/material-symbols/description.xml'),
  }),
  search: Icon.select({
    ios: 'magnifyingglass',
    android: import('@expo/material-symbols/search.xml'),
  }),
};

export function SemanticSymbol({
  name,
  size = 22,
  color,
}: {
  name: SemanticIcon;
  size?: number;
  color?: ColorValue;
}) {
  return (
    <Icon
      name={icons[name]}
      size={size}
      modifiers={decorativeIconModifiers()}
      {...(color === undefined ? {} : { color })}
    />
  );
}

const chevron = Icon.select({
  ios: 'chevron.forward',
  android: import('@expo/material-symbols/chevron_right.xml'),
});
const rtlChevron = Icon.select({
  ios: 'chevron.forward',
  android: import('@expo/material-symbols/chevron_left.xml'),
});
export function Chevron() {
  return (
    <Icon
      name={I18nManager.isRTL ? rtlChevron : chevron}
      size={16}
      modifiers={decorativeIconModifiers()}
    />
  );
}

const selectedMark = Icon.select({
  ios: 'checkmark',
  android: import('@expo/material-symbols/check.xml'),
});

export function SelectionMark() {
  return <Icon name={selectedMark} size={20} accessibilityLabel="Selected" />;
}
