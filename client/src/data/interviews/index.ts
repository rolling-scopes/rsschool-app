import { angularTemplate } from './angular';
import { corejs1Template } from './corejs1';
import { corejs2Template } from './corejs2';
import { reactTemplate } from './react';
import { shortTrackScreeningTemplate } from './shortTrackScreening';
import { shortTrackJavaScriptTemplate } from './shortTrackJavaScript';
import { shortTrackTypeScriptTemplate } from './shortTrackTypeScript';
import { shortTrackPerformanceTemplate } from 'data/interviews/shortTrackPerformance';
import { InterviewTemplateValidator } from './templateValidator';

export * from './types';

export const templates = {
  corejs1: new InterviewTemplateValidator(corejs1Template),
  corejs2: new InterviewTemplateValidator(corejs2Template),
  react: new InterviewTemplateValidator(reactTemplate),
  angular: new InterviewTemplateValidator(angularTemplate),
  shortTrackScreening: new InterviewTemplateValidator(shortTrackScreeningTemplate),
  shortTrackJavaScript: new InterviewTemplateValidator(shortTrackJavaScriptTemplate),
  shortTrackTypeScript: new InterviewTemplateValidator(shortTrackTypeScriptTemplate),
  shortTrackPerformance: new InterviewTemplateValidator(shortTrackPerformanceTemplate),
};
