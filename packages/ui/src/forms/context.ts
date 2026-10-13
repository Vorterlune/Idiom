import { createContext, useContext } from 'react';
import type { TextInput, View } from 'react-native';

export interface FocusedField {
  input: TextInput;
  container: View;
}

interface FormContextValue {
  submitting: boolean;
  requestSubmit: () => void;
  focusField: (field: FocusedField) => void;
  blurField: (input: TextInput | null) => void;
  revealFocusedField: () => void;
}

export const FormContext = createContext<FormContextValue | null>(null);
export const InFormSection = createContext(false);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) throw new Error('Form.Section and Form.TextField must be inside Form.Screen.');
  return context;
}
