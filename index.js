const path = require('path')
const os = require('os')
const buildSW = require('./src/build-sw')
const BundleServiceWorkerPlugin = require('./src/BundleServiceWorkerPlugin')

module.exports = (api, options = {}) => {
  const { pluginOptions: { swBundle, swWebpackConfig } } = options
  const swSrc = api.resolve(swBundle.swSrc)
  const swDest = swBundle.swDest
  const targetDir =  path.join(os.tmpdir(), 'vue-cli-bundle-service-worker') //
  const workBoxConfig = {
    exclude: [
      /\.map$/,
      /manifest\.json$/
    ],
    swDest,
    importWorkboxFrom: 'disabled',
    ...swBundle.workboxOptions,
    swSrc: 'non-existent-dummy-path',
  }
  const buildOptions = {
    silent: swBundle.silent,
    context: api.service.context,
    swSrc,
    swDest,
    targetDir,
    swWebpackConfig,
    workBoxConfig
  }

  api.registerCommand('build:sw', {
    description: 'Builds service worker',
    usage: 'vue-cli-service build:sw',
  }, async (args) => {
    await buildSW(Object.assign({}, args, buildOptions))
  })

  api.chainWebpack(config => {
    const target = process.env.VUE_CLI_BUILD_TARGET
    if (target && target !== 'app') {
      return
    }

    config
      .plugin('bundle-service-worker')
      .use(BundleServiceWorkerPlugin, [{ buildOptions }])
  })
}

module.exports.defaultModes = {
  'build:sw': 'production'
}
