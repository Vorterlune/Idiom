import type { ActionSheetProps } from '../types';

export type NativeActionSheetProps = Omit<ActionSheetProps, 'open' | 'onOpenChange'> & {
  presented: boolean;
  onSelect: (id: string) => void;
  onCancel: () => void;
  onDismiss: () => void;
};
