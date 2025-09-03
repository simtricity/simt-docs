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
            'flows/domain-model/meters',
            'flows/domain-model/data-collection',
            'flows/domain-model/infrastructure',
            'flows/domain-model/tariffs',
          ],
        },
        {
          type: 'category',
          label: 'Database',
          items: [
            'flows/database/index',
          ],
        },
        {
          type: 'category',
          label: 'CLI Tools',
          items: [
            'flows/cli/index',
          ],
        },
        {
          type: 'category',
          label: 'API',
          items: [
            'flows/api/index',
          ],
        },
        {
          type: 'category',
          label: 'Guides',
          items: [
            'flows/guides/index',
          ],
        },
        {
          type: 'category',
          label: 'Appendix',
          items: [
            'flows/appendix/installation',
            'flows/appendix/troubleshooting',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Flux',
      items: [
        'flux/index',
        {
          type: 'category',
          label: 'Domain Model',
          items: [
            'flux/domain-model/index',
            'flux/domain-model/devices',
          ],
        },
        {
          type: 'category',
          label: 'Database',
          items: [
            'flux/database/index',
          ],
        },
        {
          type: 'category',
          label: 'Controller',
          items: [
            'flux/controller/index',
            'flux/controller/modes',
          ],
        },
        {
          type: 'category',
          label: 'Devices',
          items: [
            'flux/devices/index',
          ],
        },
        {
          type: 'category',
          label: 'Integrations',
          items: [
            'flux/integrations/index',
          ],
        },
        {
          type: 'category',
          label: 'Deployment',
          items: [
            'flux/deployment/index',
          ],
        },
        {
          type: 'category',
          label: 'API',
          items: [
            'flux/api/index',
            'flux/api/endpoints',
          ],
        },
        {
          type: 'category',
          label: 'Guides',
          items: [
            'flux/guides/index',
          ],
        },
        {
          type: 'category',
          label: 'Operations',
          items: [
            'flux/operations/index',
          ],
        },
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
