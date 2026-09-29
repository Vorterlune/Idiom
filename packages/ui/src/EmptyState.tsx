import { Button, Column } from '@expo/ui';
import { useContext } from 'react';

import { useColors } from './internal/colors';
import { SemanticSymbol } from './internal/icons';
import { NativeHost } from './internal/native';
import { NativeText } from './internal/typography';
import { InSettingsContext } from './settings/Screen';
import type { EmptyStateProps } from './types';

export function EmptyState({ title, description, icon, action, testID }: EmptyStateProps) {
  const colors = useColors();
  const inSettings = useContext(InSettingsContext);
  const content = (
    <Column alignment="center" spacing={12} style={{ padding: 24 }} {...(testID ? { testID } : {})}>
      {icon ? <SemanticSymbol name={icon} size={36} color={colors.secondary} /> : null}
      <NativeText title color={colors.text}>
        {title}
      </NativeText>
      {description ? <NativeText color={colors.secondary}>{description}</NativeText> : null}
      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="text"
          {...(testID ? { testID: `${testID}.action` } : {})}
        />
      ) : null}
    </Column>
  );
  return inSettings ? content : <NativeHost style={{ width: '100%' }}>{content}</NativeHost>;
}
