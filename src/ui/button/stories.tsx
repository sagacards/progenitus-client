import React from 'react';
import { expect } from '@storybook/jest';
import { within, userEvent } from '@storybook/testing-library';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button, { Size } from '.';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'UI/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    size: {
      options: ['tiny', 'small', 'medium', 'large', 'xl'] as Size[],
      control: {
        type: 'select'
      }
    },
    alt: { control: 'boolean' },
    onClick: { action: true },
  },
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Button',
  alt: false,
};

Primary.play = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.hover(canvas.getByText('Button'));
  await userEvent.click(canvas.getByText('Button'));
  await expect(args.onClick).toHaveBeenCalled();
};
