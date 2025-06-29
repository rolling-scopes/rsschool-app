export const emailPattern = /[^@]+@[^.]+\..+/g;
export const epamEmailPattern = /[^@]+_[^@]+@epam.com/gi;

// eslint-disable-next-line no-control-regex
export const englishNamePattern = /^[\x00-\x7F]+$/g;
export const phonePattern = /^\+[1-9]{1}[0-9]{3,14}$/gi;
export const urlPattern = /^(http|https):\/\/.+(\.[a-z]{2,10})/g;
export const urlWithIpPattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

export const notGithubPattern = /^((?!https:\/\/github.com\/).)*$/gi;
export const privateRsRepoPattern = /https:\/\/github\.com\/rolling-scopes-school\//;

export const githubPrUrl = /https:\/\/github.com\/(\w|\d|-)+\/(\w|\d|-)+\/pull\/(\d)+/gi;
export const githubRepoUrl = /https:\/\/github.com\/(\w|\d|-)+\/(\w|\d|-)+/gi;
export const githubUsernamePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,37}[a-zA-Z0-9]$/;

export const notUrlPattern = /^((?!\/).)*$/g;

export const passwordPattern = /^\d+_[a-zA-Z0-9]+$/;

export const weAreCommunityUrlPattern = /^(https?:\/\/)?(www\.)?wearecommunity\.io.*$/;
export const rsAppRegistryUrlPattern = /^(https?:\/\/)?(www\.)?app\.rs\.school\/registry\/student\?course=.+$/;
