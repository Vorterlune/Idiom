import { Column, Text } from '@expo/ui';
import { useContext } from 'react';

import { useColors } from '../internal/colors';
import type { FormSectionProps } from '../types';
import { InFormSection, useFormContext } from './context';
import { FormHost } from './Host';

export function FormSection({ children, title, footer, testID }: FormSectionProps) {
  useFormContext();
  const nested = useContext(InFormSection);
  const colors = useColors();
  const content = (
    <InFormSection value={true}>
      <Column spacing={8} style={{ width: '100%' }} {...(testID ? { testID } : {})}>
        {title ? (
          <Text textStyle={{ fontSize: 17, fontWeight: '600', color: colors.text }}>{title}</Text>
        ) : null}
        <Column
          spacing={0}
          style={{ width: '100%', backgroundColor: colors.surface, borderRadius: 12 }}
        >
          {children}
        </Column>
        {footer ? (
          <Text textStyle={{ fontSize: 15, color: colors.secondary }}>{footer}</Text>
        ) : null}
      </Column>
    </InFormSection>
  );
  return nested ? content : <FormHost>{content}</FormHost>;
}
