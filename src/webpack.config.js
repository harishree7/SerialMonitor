var path = require("path");
var fs = require("fs");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var BomPlugin = require("webpack-utf8-bom");
var CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = [
  {
    devtool: "source-map",
    entry: {
      bundle: "./web/entry.jsx"
    },
    output: {
      path: path.resolve(__dirname, "./bundle/web/"),
      filename: "[name].js",
      sourceMapFilename: "bundle.map"
    },
    resolve: {
      extensions: [".js", ".jsx"]
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          loader: "babel-loader",
          include: [path.resolve(__dirname, "./")],
          exclude: [/node_modules/, "./app"],
          query: {
            presets: ["babel-preset-env", "babel-preset-react"]
          }
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: "file-loader",
          query: {
            name: "assets/[name].[ext]?[hash]"
          }
        },
        {
          test: /\.(eot|ttf|svg|woff2?)(\?.*)?$/,
          loader: "url-loader?limit=100&name=fonts/[name].[ext]"
        },
        {
          test: /\.(css|scss)$/,
          loaders: ["style-loader", "css-loader", "sass-loader"]
        },
        {
          test: /\.(htm|html)$/,
          loader: "html-loader",
          query: {
            name: "[name].[ext]?[hash]"
          }
        },
        {
          test: /\.node$/,
          loader: "node-loader"
        }
      ]
    },
    target: "electron",
    externals: {
      sqlite3: "commonjs sqlite3",
      serialport: "commonjs serialport"
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "web/templates/index.html",
        inject: false
      }),
      new BomPlugin(true, /\.(js|jsx)$/),
      new CopyWebpackPlugin([
        {
          from: path.resolve("web", "assets"),
          to: path.resolve("bundle/web/assets")
        }
      ])
    ]
  },
  {
    entry: "./app/app.js",
    output: {
      path: path.resolve(__dirname, "./bundle/app"),
      publicPath: "/bundle/",
      filename: "app.js"
    },
    target: "electron",
    module: {
      exprContextCritical: true,
      wrappedContextCritical: true,
      wrappedContextRecursive: true,
      wrappedContextRegExp: /^\.\//,
      exprContextRegExp: /^\.\//,
      unknownContextRegExp: /^\.\//,
      loaders: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          include: [path.resolve(__dirname, "app")],
          exclude: [/node_modules/, /extensions/]
        }
      ],
      rules: [
        {
          test: /\.node$/,
          use: "node-loader"
        }
      ]
    },
    resolve: {
      modules: [path.resolve("./node_modules")]
    },
    externals: {
      sqlite3: "commonjs sqlite3",
      serialport: "commonjs serialport"
    },
    plugins: [
      new webpack.DefinePlugin({
        $dirname: "__dirname"
      })
    ]
  }
];
