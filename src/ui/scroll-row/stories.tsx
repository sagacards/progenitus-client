import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ScrollRow from '.'
import { TarotDeckData } from '../../apis/cards'
import LegendPreview from '../../ui/legend-preview'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'UI/ScrollRow',
  component: ScrollRow,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
} as ComponentMeta<typeof ScrollRow>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ScrollRow> = (args) => <ScrollRow {...args} />;

const cards = Array(22).fill(undefined).map((x, i) => ({
  title: TarotDeckData[i].name,
  flavour: TarotDeckData[i].keywords.slice(0, 3).join(', '),
  image: '',
  featured: false,
}));

export const Primary = Template.bind({});
Primary.args = {
  children: cards.map((card, i) => <LegendPreview {...card} key={`card-${card.title}`} />),
};
