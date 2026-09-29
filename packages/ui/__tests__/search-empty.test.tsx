import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState, SearchBar } from '../src';

describe('SearchBar', () => {
  it('emits changed text and remains controlled until rerender', async () => {
    const onChangeText = jest.fn();
    const result = await render(
      <SearchBar value="" onChangeText={onChangeText} placeholder="Search settings" />,
    );

    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    await fireEvent.changeText(
      screen.getByRole('search', { name: 'Search settings' }),
      'notifications',
    );
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('notifications');
    expect(screen.getByDisplayValue('')).toBeOnTheScreen();

    await result.rerender(<SearchBar value="notifications" onChangeText={onChangeText} />);
    expect(screen.getByDisplayValue('notifications')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeOnTheScreen();
  });

  it('clears once and removes the clear action when the caller resets its value', async () => {
    const onChangeText = jest.fn();
    const result = await render(<SearchBar value="notifications" onChangeText={onChangeText} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('');
    expect(screen.getByDisplayValue('notifications')).toBeOnTheScreen();

    await result.rerender(<SearchBar value="" onChangeText={onChangeText} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('submits without modifying the controlled query', async () => {
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();
    await render(<SearchBar value="privacy" onChangeText={onChangeText} onSubmit={onSubmit} />);

    await fireEvent(screen.getByRole('search'), 'submitEditing', {
      nativeEvent: { text: 'privacy' },
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onChangeText).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('privacy')).toBeOnTheScreen();
  });

  it('does not emit an unchanged query', async () => {
    const onChangeText = jest.fn();
    await render(<SearchBar value="privacy" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByRole('search'), 'privacy');
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('disables text entry, clearing, and submission together', async () => {
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();
    await render(
      <SearchBar value="privacy" onChangeText={onChangeText} onSubmit={onSubmit} disabled />,
    );

    const input = screen.getByRole('search');
    const clear = screen.getByRole('button', { name: 'Clear search' });
    expect(input).toBeDisabled();
    expect(clear).toBeDisabled();
    await fireEvent.changeText(input, 'account');
    await fireEvent.press(clear);
    await fireEvent(input, 'submitEditing');
    expect(onChangeText).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows an accessible name separate from its placeholder', async () => {
    await render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        placeholder="Search"
        accessibilityLabel="Filter preferences"
      />,
    );
    expect(screen.getByRole('search', { name: 'Filter preferences' })).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Search')).toBeOnTheScreen();
  });
});

describe('EmptyState', () => {
  it('renders its explanation and optional action', async () => {
    const onPress = jest.fn();
    await render(
      <EmptyState
        title="No results"
        description="Try another search."
        action={{ label: 'Clear filters', onPress }}
      />,
    );

    expect(screen.getByText('No results')).toBeOnTheScreen();
    expect(screen.getByText('Try another search.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not create an action when none is supplied', async () => {
    await render(<EmptyState title="No results" />);
    expect(screen.getByText('No results')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
