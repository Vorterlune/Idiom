import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { ActionSheetProps } from '../types';
import { NativeActionSheet } from './platform';

export function ActionSheet(props: ActionSheetProps) {
  const problem =
    props.actions.length === 0
      ? 'actions must contain at least one item'
      : new Set(props.actions.map((action) => action.id)).size !== props.actions.length
        ? 'action IDs must be unique'
        : undefined;
  useEffect(() => {
    if (__DEV__ && problem) console.warn(`[Idiom] ActionSheet "${props.title}": ${problem}.`);
  }, [problem, props.title]);

  const [presentation, setPresentation] = useState({ open: props.open, generation: 0 });
  if (presentation.open !== props.open) {
    setPresentation({
      open: props.open,
      generation: presentation.generation + (props.open ? 1 : 0),
    });
  }
  // Retain the resolved presentation while native adapters finish hiding. Only
  // opening again replaces it, so a parent's closure does not cut off animation.
  return <Presentation key={presentation.generation} {...props} open={props.open && !problem} />;
}

function Presentation(props: ActionSheetProps) {
  const [closed, setClosed] = useState(!props.open);
  const resolved = useRef(!props.open);
  const mounted = useRef(true);
  const pendingDismissal = useRef<number | null>(null);
  const current = useRef(props);

  useLayoutEffect(() => {
    current.current = props;
    if (!props.open) {
      resolved.current = true;
      if (pendingDismissal.current !== null) cancelAnimationFrame(pendingDismissal.current);
      pendingDismissal.current = null;
    }
  }, [props]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (pendingDismissal.current !== null) cancelAnimationFrame(pendingDismissal.current);
    };
  }, []);

  function resolve(id?: string) {
    if (!mounted.current || resolved.current || !current.current.open) return;
    const action =
      id === undefined ? undefined : current.current.actions.find((item) => item.id === id);
    if (id !== undefined && (!action || action.disabled)) return;
    resolved.current = true;
    if (pendingDismissal.current !== null) cancelAnimationFrame(pendingDismissal.current);
    pendingDismissal.current = null;
    setClosed(true);
    current.current.onOpenChange(false);
    action?.onPress();
  }

  function dismiss() {
    if (
      !mounted.current ||
      resolved.current ||
      !current.current.open ||
      pendingDismissal.current !== null
    )
      return;
    // SwiftUI can report dismissal before its queued button event arrives.
    pendingDismissal.current = requestAnimationFrame(() => {
      pendingDismissal.current = null;
      resolve();
    });
  }

  return (
    <NativeActionSheet
      {...props}
      presented={props.open && !closed}
      onSelect={resolve}
      onCancel={() => resolve()}
      onDismiss={dismiss}
    />
  );
}
