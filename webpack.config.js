var webpack = require('webpack');
var path = require('path');

const {LicenseWebpackPlugin} = require('license-webpack-plugin');
const {CommonsChunkPlugin} = require('webpack').optimize;
const { spawn } = require('child_process');

var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src');

const nodeModules = path.join(process.cwd(), 'node_modules');

const port = process.env.PORT || 7777;
const publicPath = `http://localhost:${port}/`;

var config = {
    devtool: "source-map",
    target: "web",
    entry: {
        "app": [APP_DIR + '/add.ts']
    },

    output: {
        path: BUILD_DIR,
        filename: '[name].dev.js'
    },

    resolve: {
        extensions: ['.js', '.ts']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'awesome-typescript-loader',
                query: {
                    useBabel: true,
                    useCache: true
                }
            }
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin({}),
        new CommonsChunkPlugin({
            "name": [
                "vendor"
            ],
            "minChunks": (module) => {
                return module.resource && module.resource.startsWith(nodeModules);
            },
            "chunks": [
                "app"
            ]
        }),
        new LicenseWebpackPlugin({
            "pattern": /^(MIT|ISC|BSD.*)$/
        }),
    ],

    devServer: {
        port,
        publicPath,
        compress: true,
        noInfo: true,
        stats: 'errors-only',
        inline: true,
        lazy: false,
        hot: true,
        headers: {'Access-Control-Allow-Origin': '*'},
        contentBase: path.join(__dirname, 'dist'),
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: 100
        },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false,
        },
    },
};

module.exports = config;
