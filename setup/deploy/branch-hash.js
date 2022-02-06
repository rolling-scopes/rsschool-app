const crypto = require('crypto');

const branch = crypto
  .createHash('md5')
  .update(process.env.GITHUB_REF_NAME ?? 'master')
  .digest('hex')
  .substring(0, 8);

console.log(branch);
