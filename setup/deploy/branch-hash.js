const crypto = require('crypto');

const branch = crypto
  .createHash('md5')
  .update(process.env.GITHUB_HEAD_REF ?? 'master')
  .digest('hex')
  .substring(0, 8);

console.log(branch);
