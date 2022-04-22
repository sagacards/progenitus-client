import React from 'react';
import { expect } from '@storybook/jest';
import { within, userEvent } from '@storybook/testing-library';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Timer from '.';
import { DateTime } from 'luxon';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'UI/Timer',
  component: Timer,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    onClick: { action: true }
  },
} as ComponentMeta<typeof Timer>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Timer> = (args) => <Timer {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  time : DateTime.fromMillis(new Date().getTime() + 36 * 3_600_000)
};

Primary.play = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
};
