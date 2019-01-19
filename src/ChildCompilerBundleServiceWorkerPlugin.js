const path = require('path')
const { InjectManifest } = require('workbox-webpack-plugin')
const { SingleEntryPlugin } = require('webpack')

const ID = 'vue-cli:bundle-service-worker-plugin'

module.exports = class ChildCompilerBundleServiceWorkerPlugin {
  constructor ({ buildOptions }) {
    this.buildOptions = buildOptions
    this.workboxInject = new InjectManifest(buildOptions.workBoxConfig)
  }

  apply (compiler) {
    compiler.hooks.make.tapAsync(ID, (compilation, cb) => {
      const { dest, context, src, plugins } = this.buildOptions
      const childCompiler = compilation.createChildCompiler(
        ID,
        {
          filename: dest,
        },
        plugins
      )

      childCompiler.apply(
        new SingleEntryPlugin(
          context, src, dest
        )
      )

      compilation.hooks.additionalAssets.tapAsync(ID, (childProcessDone) => {
        childCompiler.runAsChild((err, entries, childCompilation) => {
          const errors = (err ? [err] : []).concat(childCompilation.errors)

          childCompilation.fileDependencies.forEach((file) => {
            compilation.fileDependencies.add(path.resolve(context, file))
          })

          if (!errors.length) {
            compilation.assets = Object.assign(
              childCompilation.assets,
              compilation.assets
            )

            compilation.namedChunkGroups = Object.assign(
              childCompilation.namedChunkGroups,
              compilation.namedChunkGroups
            )

            const readFile = (_, callback) => callback(null, childCompilation.assets[dest].source())
            return this.workboxInject.handleEmit(compilation, readFile)
              .then(() => {
                childProcessDone()
              })
              .catch(err => {
                compilation.errors.push(err)
                childProcessDone()
              })
          }
          compilation.errors.push(...errors)
          childProcessDone()
        })
      })

      cb()
    })
  }
}
