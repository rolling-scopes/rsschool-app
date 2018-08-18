export * from './tests';

export const compose = (...funcs: Array<any>) =>
    funcs.reduce((a: any, b: any) => (...args: Array<any>) => a(b(...args)), (arg: any) => arg);
