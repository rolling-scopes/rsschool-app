export const emailPattern = /[^@]+@[^\.]+\..+/g;
export const epamEmailPattern = /[^@]+_[^@]+@epam.com/gi;

export const englishNamePattern = /^[\x00-\x7F]+$/g;
export const phonePattern = /^\+[1-9]{1}[0-9]{3,14}$/gi;
export const urlPattern = /^(http|https):\/\/.+(\.[a-z]{2,10})/g;
export const urlWithIpPattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

export const notGithubPattern = /^((?!https:\/\/github.com\/).)*$/g;

export const githubPrUrl = /https:\/\/github.com\/(\w|\d|\-)+\/(\w|\d|\-)+\/pull\/(\d)+/gi;
export const githubRepoUrl = /https:\/\/github.com\/(\w|\d|\-)+\/(\w|\d|\-)+/gi;

export const udemyCertificateId = /^UC-/g;
export const notUrlPattern = /^((?!\/).)*$/g;
