const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const rules = require('./webpack.rules')

rules.push({
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
})

module.exports = {
    // Put your normal webpack config below here
    module: {
        rules
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/hbs-templates'),
                    to: path.resolve(
                        __dirname,
                        '.webpack/main',
                        'src/hbs-templates'
                    )
                },
                {
                    from: path.resolve(__dirname, 'src/images'),
                    to: path.resolve(
                        __dirname,
                        '.webpack/main',
                        'src/images'
                    )
                },
                {
                    from: path.resolve(__dirname, 'src/images/pseudopia-logo.svg'),
                    to: path.resolve(
                        __dirname,
                        '.webpack/renderer/main_window',
                        'images/pseudopia-logo.svg'
                    )
                }
            ]
        })
    ]
}
