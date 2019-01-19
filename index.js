const ChildCompilerBundleServiceWorkerPlugin = require('./src/ChildCompilerBundleServiceWorkerPlugin')

module.exports = (api, options = {}) => {
  const { pluginOptions: { swBundle } } = options
  const src = api.resolve(swBundle.src)
  const dest = swBundle.dest
  const plugins = swBundle.plugins
  const workboxOptions = swBundle.workboxOptions || {}
  const workBoxConfig = {
    exclude: [
      /\.map$/,
      /manifest\.json$/,
    ],
    swDest: dest,
    importWorkboxFrom: 'disabled',
    ...workboxOptions,
    ...{
      exclude: [
        ...(workboxOptions.exclude ? workboxOptions.exclude : []),
        dest,
      ],
    },
    swSrc: src,
  }
  const buildOptions = {
    silent: swBundle.silent,
    context: api.service.context,
    src,
    dest,
    workBoxConfig,
    plugins,
  }

  api.chainWebpack(config => {
    const target = process.env.VUE_CLI_BUILD_TARGET
    if (target && target !== 'app') {
      return
    }

    config
      .plugin('bundle-service-worker')
      .use(ChildCompilerBundleServiceWorkerPlugin, [{ buildOptions }])
  })
}
