
module.exports ={
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: { loader: 'worker-loader' },
        },
      ],
    },
  },
  lintOnSave: false
};
