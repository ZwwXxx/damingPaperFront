const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 其他配置
  css: {
    loaderOptions: {
      postcss: {
        postcssOptions: {
          plugins: [
            require('tailwindcss'),
            require('autoprefixer')
          ]
        }
      }
    }
  },
  devServer: {
    compress:false,
    // host: '0.0.0.0'
    // 作用：这将使开发服务器监听所有网络接口，这样你可以通过本机的 IP 地址或主机名访问应用，而不仅仅是 localhost。
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VUE_APP_BASE_API]: {
        target: process.env.VUE_APP_BASE_URL,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      },
    },
    // disableHostCheck: true
    // disableHostCheck: true 是 Vue CLI 开发服务器中的一个配置选项，以下是对其作用和潜在风险的详细说明：
    // 作用
    // 禁用主机名检查：当设置为 true 时，开发服务器将不会检查请求中的 Host 头部。这意味着即使请求的 Host 头部与服务器实际监听的主机名不匹配，服务器仍然会接受这些请求。
    // 使用场景
    // 开发环境：在开发环境中，可能会使用不同的地址或域名来访问应用程序。例如，使用本机的 IP 地址、Docker 容器的名称，或者使用特定的 DNS 服务。在这些情况下，可能会遇到主机名检查失败的问题。禁用主机名检查可以避免这些问题，确保开发者能够顺利访问应用。
  },
});
