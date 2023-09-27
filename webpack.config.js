const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    devServer: {
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                },
            },
            {
                test: /\.html$/,
                use: [
                  {
                    loader: 'html-loader',
                  },
                ],
            },
        ]
    }, 
    plugins: [
        new HTMLWebpackPlugin({template: "./src/index.html"}),
        new MiniCssExtractPlugin()
    ],
};
