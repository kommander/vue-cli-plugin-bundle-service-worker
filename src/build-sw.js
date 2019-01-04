const webpack = require('webpack')
const merge = require('webpack-merge')


module.exports = ({ silent, targetDir, swSrc, swDest, swWebpackConfig = {} }) => {
  const webpackConfig = merge({
    mode: process.env.NODE_ENV,
    entry: swSrc,
    output: {
      path: targetDir,
      filename: swDest,
    },
  }, swWebpackConfig)

  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig)

    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        stats.compilation.errors.forEach(err => console.error(err))
        return reject(new Error(`Service worker build failed with errors.`))
      }

      if (!silent) {
        console.log(stats.toString({
          // Add console colors
          colors: true
        }))
      }

      resolve(Array.from(stats.compilation.fileDependencies))
    })
  })
}
