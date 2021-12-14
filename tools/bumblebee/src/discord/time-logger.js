const fs = require('fs');
const path = require('path');
const { catcher } = require('../lib/common');

const { TIMESTAMP_FILE_NAME } = require('../constants/discord-bridge');

const PATH_TO_FILE = path.join(__dirname, '../../', TIMESTAMP_FILE_NAME);

module.exports.saveTime = catcher((time) => {
  fs.writeFileSync(PATH_TO_FILE, JSON.stringify(time));
});

module.exports.readTime = catcher(() => {
  if (fs.existsSync(PATH_TO_FILE)) {
    const file = fs.readFileSync(PATH_TO_FILE);

    return JSON.parse(file);
  }

  return { timestamp: Date.now() };
});
