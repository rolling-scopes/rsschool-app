import { angularTemplate } from './angular';
import { corejs1Template } from './corejs1';
import { corejs2Template } from './corejs2';
import { reactTemplate } from './react';
import { shortTrackScreeningTemplate } from './shortTrackScreening';
import { shortTrackJavaScriptTemplate } from './shortTrackJavaScript';
import { shortTrackTypeScriptTemplate } from './shortTrackTypeScript';
export * from './types';

export const templates = {
  corejs1: corejs1Template,
  corejs2: corejs2Template,
  react: reactTemplate,
  angular: angularTemplate,
  shortTrackScreening: shortTrackScreeningTemplate,
  shortTrackJavaScript: shortTrackJavaScriptTemplate,
  shortTrackTypeScript: shortTrackTypeScriptTemplate,
};
