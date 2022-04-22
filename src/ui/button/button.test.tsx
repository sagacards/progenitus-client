import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';
import * as stories from './stories'; // import all stories from the stories file

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Primary } = composeStories(stories);

test('renders primary button with default args', () => {
  render(<Primary />);
  const buttonElement = screen.getByText(
    /Button/i
  );
  expect(buttonElement).not.toBeNull();
});

test('renders primary button with overriden props', () => {
  render(<Primary>Hello world</Primary>); // you can override props and they will get merged with values from the Story's args
  const buttonElement = screen.getByText(/Hello world/i);
  expect(buttonElement).not.toBeNull();
});