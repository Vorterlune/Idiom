import { useLayoutEffect, useRef, useState } from 'react';

import type { ConfirmationDialogProps } from '../types';
import { NativeConfirmationDialog } from './platform';

/** A false-to-true transition creates a fresh native presentation. */
export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const [presentation, setPresentation] = useState({ open: props.open, generation: 0 });
  if (presentation.open !== props.open) {
    setPresentation({ open: props.open, generation: presentation.generation + 1 });
    return null;
  }
  if (!props.open) return null;
  return <Presentation key={presentation.generation} {...props} />;
}

function Presentation({ onOpenChange, onConfirm, ...props }: ConfirmationDialogProps) {
  const [closed, setClosed] = useState(false);
  const resolved = useRef(false);
  const mounted = useRef(true);
  const pendingDismissal = useRef<number | null>(null);
  const callbacks = useRef({ onOpenChange, onConfirm });

  useLayoutEffect(() => {
    callbacks.current = { onOpenChange, onConfirm };
  }, [onOpenChange, onConfirm]);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (pendingDismissal.current !== null) cancelAnimationFrame(pendingDismissal.current);
    };
  }, []);

  function resolve(confirmed: boolean) {
    if (!mounted.current || resolved.current) return;
    resolved.current = true;
    if (pendingDismissal.current !== null) cancelAnimationFrame(pendingDismissal.current);
    pendingDismissal.current = null;
    setClosed(true);
    callbacks.current.onOpenChange(false);
    if (confirmed) callbacks.current.onConfirm();
  }

  function dismiss() {
    if (!mounted.current || resolved.current || pendingDismissal.current !== null) return;
    // SwiftUI reports presentation changes separately from button activation.
    // Let a queued button event resolve the choice before treating it as dismissal.
    pendingDismissal.current = requestAnimationFrame(() => {
      pendingDismissal.current = null;
      resolve(false);
    });
  }

  return (
    <NativeConfirmationDialog
      {...props}
      presented={!closed}
      onConfirm={() => resolve(true)}
      onCancel={() => resolve(false)}
      onDismiss={dismiss}
    />
  );
}
