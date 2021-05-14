export const emailPattern = /[^@]+@[^\.]+\..+/g;
export const epamEmailPattern = /[^@]+_[^@]+@epam.com/gi;

export const englishNamePattern = /^[\x00-\x7F]+$/g;
export const phonePattern = /^\+[1-9]{1}[0-9]{3,14}$/g;
export const urlPattern = /^(http|https):\/\/.+(\.[a-z]{2,10})/g;
export const urlWithIpPattern =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?|^((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

export const notGithubPattern = /^((?!https:\/\/github.com\/).)*$/g;

export const githubPrUrl = /https:\/\/github.com\/(\w|\d|\-)+\/(\w|\d|\-)+\/pull\/(\d)+/gi;
export const githubRepoUrl = /https:\/\/github.com\/(\w|\d|\-)+\/(\w|\d|\-)+/gi;

export const udemyCertificateId = /^UC-/g;
export const notUrlPattern = /^((?!\/).)*$/g;
