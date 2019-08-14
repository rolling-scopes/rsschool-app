const withSass = require("@zeit/next-sass");
const path = require("path");
const webpack = require("webpack");
const withTypescript = require("@zeit/next-typescript");
const withCSS = require("@zeit/next-css");

const nextConfig = {
  serverRuntimeConfig: {
    rsHost: process.env.RS_HOST || "http://localhost:3000",
  },
  env: {
    BUILD_VERSION: process.env.BUILD_VERSION || "0.0.0.0.0",
    APP_VERSION: process.env.APP_VERSION,
  },
  webpack: config => {
    config.resolve.alias["components"] = path.join(__dirname, "components");
    config.resolve.alias["services"] = path.join(__dirname, "services");
    return config;
  },
};

module.exports = withTypescript(withCSS(withSass(nextConfig)));
