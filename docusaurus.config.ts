import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Simtricity',
  tagline: 'Energy Management Platform Documentation',
  favicon: 'img/favicon.ico',
  
  markdown: {
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-mermaid',
    // Only load search plugin if not in CI environment
    ...(process.env.CI ? [] : [
      [
        require.resolve('@easyops-cn/docusaurus-search-local'),
        {
          hashed: true,
          language: ['en'],
          indexDocs: true,
          indexBlog: false,
          docsRouteBasePath: '/docs',
          highlightSearchTermsOnTargetPage: true,
          searchBarPosition: 'right',
        },
      ],
    ]),
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.simtricity.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'simtricity', // Usually your GitHub org/user name.
  projectName: 'simt-docs', // Usually your repo name.
  trailingSlash: undefined,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese,
  // you may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Enable versioning with 0.0.1 and latest
          lastVersion: 'current',
          versions: {
            current: {
              label: 'Latest',
              path: '/',
              banner: 'unreleased',
            },
            '0.0.1': {
              label: '0.0.1',
              path: '0.0.1',
              banner: 'unmaintained',
            },
          },
          // Please change this to your repo.
          editUrl: 'https://github.com/simtricity/simt-docs/tree/main/',
        },
        blog: false, // Disable blog for now
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Simtricity Docs',
      logo: {
        alt: 'Simtricity Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          href: 'https://github.com/simtricity',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            {
              label: 'Flows',
              to: '/docs/flows/',
            },
            {
              label: 'Flux',
              to: '/docs/flux/',
            },
            {
              label: 'MyEnergy',
              to: '/docs/myenergy/',
            },
          ],
        },
        {
          title: 'Company',
          items: [
            {
              label: 'Simtricity Website',
              href: 'https://simtricity.io',
            },
            {
              label: 'Book a Demo',
              href: 'mailto:hello@simtricity.io',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/simtricity',
            },
            {
              label: 'API Reference',
              to: '/docs/flows/api/',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Simtricity Limited. Building the future of local energy.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;