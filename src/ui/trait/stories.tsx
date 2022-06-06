import React from 'react';
import { expect } from '@storybook/jest';
import { within, userEvent } from '@storybook/testing-library';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Trait, Traits } from '.';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'UI/Trait',
  component: Traits,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
} as ComponentMeta<typeof Trait>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Trait> = (args) => <Traits>
  <Trait label='border' value='line' rarity='common' />
  <Trait label='back' value='cinematic' rarity='uncommon' />
  <Trait label='stock' value='white' rarity='rare' />
  <Trait label='ink' value='fool-brilliant' rarity='epic' />
  <Trait label='ink' value='sultan' rarity='legendary' />
</Traits>;

export const Primary = Template.bind({});
