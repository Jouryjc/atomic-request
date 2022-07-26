import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',

  title: 'Atomic Request',
  description: 'A library for aggregating API requests',

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }]],

  themeConfig: {
    logo: '/icon.svg',

    nav: [
      { text: '开始', link: '/guide/getting-start', activeMatch: '/guide/getting-start' },
      { text: '配置', link: '/guide/configuration', activeMatch: '/guide/configuration' },
      { text: '示例', link: '/guide/how-to-use', activeMatch: '/guide/how-to-use' },
    ],

    // sidebar: {
    //   '/guide/': {
    //     text: ''
    //   }
    // },

    socialLinks: [{ icon: 'github', link: 'https://github.com/Jouryjc/atomic-requests' }],

    lastUpdatedText: 'Updated Date',

    // footer: {
    //   message: 'Released under the MIT License.',
    //   copyright: 'Copyright © 2019-present Jouryjc'
    // }
  },
})
