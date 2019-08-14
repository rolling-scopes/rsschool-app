import commander from 'commander';
import * as descr from './constants/commands-description';
import get from './commands/get';
import fetchWithApi from './commands/fetch-with-api';
import updateWithApi from './commands/update-with-api';
import updateWithApiAndGss from './commands/update-with-api-and-gss';

commander
  .version('0.0.1')
  .description('This is command line tool with set of parsers for Rolling Scopes School');

commander
  .command('get <service> <input> [output]')
  .alias('g')
  .description(descr.GET)
  .action(get);

commander
  .command('fetch-with-api <service> [output]')
  .alias('f')
  .description(descr.FETCH_WITH_API)
  .action(fetchWithApi);

commander
  .command('update-with-api <service> [output]')
  .alias('u')
  .description(descr.UPDATE_WITH_API)
  .action(updateWithApi);

commander
  .command('update-with-api-and-gss <id> <task-name> [output]')
  .alias('G')
  .description(descr.UPDATE_WITH_API_AND_GSS)
  .action(updateWithApiAndGss);

commander.parse(process.argv);
