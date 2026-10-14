---
title: SearchBar and EmptyState
description: Controlled search and a readable empty result with an application action.
---

## SearchBar

`SearchBar` requires `value` and `onChangeText`. Optional props are `placeholder`, `disabled`, `onSubmit`, `accessibilityLabel`, and `testID`.

```tsx
<SearchBar
  value={query}
  onChangeText={setQuery}
  placeholder="Search preferences"
  onSubmit={() => search(query)}
/>
```

The clear control requests an empty string. A disabled search cannot edit or clear. Filtering, debouncing, network requests, and result state belong in your application.

## EmptyState

`EmptyState` requires a `title`. `description`, semantic `icon`, `action: { label, onPress }`, and `testID` are optional.

```tsx
<EmptyState
  icon="search"
  title="No preferences found"
  description="Try another search."
  action={{ label: 'Clear search', onPress: () => setQuery('') }}
/>
```

## Use them together

```tsx
import { useState } from 'react';
import { EmptyState, SearchBar, Settings } from '@idiom/ui';

export function SearchPreferences() {
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState(true);
  const matches = 'notifications'.includes(query.trim().toLowerCase());

  return (
    <Settings.Screen title="Settings" header={<SearchBar value={query} onChangeText={setQuery} />}>
      {matches ? (
        <Settings.Section title="Preferences">
          <Settings.Toggle
            label="Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />
        </Settings.Section>
      ) : (
        <EmptyState
          title="No preferences found"
          action={{ label: 'Clear search', onPress: () => setQuery('') }}
        />
      )}
    </Settings.Screen>
  );
}
```

Screen’s RN `header` sits above its native scrolling viewport. Keep an enclosing `IdiomProvider` above standalone components when you use appearance or accent overrides.
