import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/index',
      ],
    },
    {
      type: 'category',
      label: 'Flows',
      items: [
        'flows/index',
        'flows/architecture',
        {
          type: 'category',
          label: 'Domain Model',
          items: [
            'flows/domain-model/index',
            'flows/domain-model/customers',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Flux',
      items: [
        'flux/index',
      ],
    },
    {
      type: 'category',
      label: 'MyEnergy',
      items: [
        'myenergy/index',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/index',
      ],
    },
  ],
};

export default sidebars;
