module.exports = {
  title: 'backend-lib',
  base: '/backend-lib/',

  themeConfig: {
    // search: false,
    repo: 'NaturalCycles/backend-lib',
    docsDir: 'docs',
    smoothScroll: true,
    nav: [],
    sidebar: {
      '/': [
        {
          // title: 'Menu',
          collapsable: false,
          children: ['', 'admin', 'gae', 'http-db', 'sentry', 'express', 'other'],
        },
      ],
    },
  },

  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    [
      'vuepress-plugin-typescript',
      {
        tsLoaderOptions: {
          transpileOnly: true,
        },
      },
    ],
  ],
  evergreen: true,
}
