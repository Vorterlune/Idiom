import type { ConfirmationDialogProps } from '../types';

export type NativeConfirmationDialogProps = Omit<
  ConfirmationDialogProps,
  'open' | 'onOpenChange' | 'onConfirm'
> & {
  presented: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss: () => void;
};
