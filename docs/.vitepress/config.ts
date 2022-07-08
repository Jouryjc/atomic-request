import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  
  title: 'AtomicRequest',

  description: 'A library for aggregating API requests',

  themeConfig: {
    nav: getNav(),
  
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Jouryjc/atomic-requests' },
    ],

    lastUpdatedText: 'Updated Date',

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Jouryjc'
    }
  }
})

function getNav () {
  return [
    { text: '开始使用', link: '/guide/getting-started', activeMatch: '/guide/' },
  ]
}