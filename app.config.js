const { expo: base } = require('./app.json');

const IS_DEV     = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const APP_NAME = IS_DEV ? 'ArcRise Dev' : IS_PREVIEW ? 'ArcRise Preview' : 'ArcRise';
const PKG_NAME = IS_DEV
  ? 'com.arcrise.app.dev'
  : IS_PREVIEW
  ? 'com.arcrise.app.preview'
  : 'com.arcrise.app';

module.exports = {
  expo: {
    ...base,
    name: APP_NAME,
    android: {
      ...base.android,
      package: PKG_NAME,
    },
  },
};
