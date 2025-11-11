const components = require('prismjs/components')
const allLanguages = Object.keys(components.languages).filter((item) => item !== 'meta')
module.exports = {
  plugins: [
    [
      'prismjs',
      {
        languages: allLanguages,
        plugins: ['line-numbers', 'show-language', 'copy-to-clipboard'],
        css: true,
      },
    ],
  ],
  presets: ['@vue/cli-plugin-babel/preset'],
}
