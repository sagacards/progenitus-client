import '../src/index.css';
import { addDecorator } from "@storybook/react";
import { MemoryRouter } from "react-router";

addDecorator(story => <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: { disable: true },
}

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'dark',
    toolbar: {
      icon: 'contrast',
      items: [
        { value: 'dark', title: 'Dark' },
        { value: 'light', title: 'Light' },
      ]
    }
  },
};

// function theme (Story, context) {
//   console.log(context);
// };

// export const decorators = [theme];

// document.querySelector('html')?.setAttribute('data-theme', colorScheme);