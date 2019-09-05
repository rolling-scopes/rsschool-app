import commander from 'commander';
import * as descr from './constants/commands-description';
import get from './commands/get';
import update from './commands/update';
import updateFromGss from './commands/update-from-gss';

commander
  .version('0.0.1')
  .description('This is command line tool with set of parsers for Rolling Scopes School');

commander
  .command('get <service> [alt-task-name]')
  .alias('g')
  .description(descr.GET)
  .action(get);

commander
  .command('update <service> [alt-task-name]')
  .alias('u')
  .description(descr.UPDATE)
  .action(update);

commander
  .command('update-from-gss <id> <task-name>')
  .alias('ufg')
  .description(descr.UPDATE_FROM_GSS)
  .action(updateFromGss);

commander
  .option(
    '-s, --students <students>',
    'run job only for specific students (githubId\'s delimited by comma)',
  );

commander
  .option(
    '-a, --course-alias <course-alias>',
    'course alias like "rs-2018-q3",\if not specified the last course will be used by default',
  );

commander
  .option(
    '-e, --error-log-path <error-log-path>',
    'path to error log, if no specified log file won\'t be created',
  );

commander
  .option(
    '-o, --output <output>',
    'path to file for writing results',
  );

commander.parse(process.argv);
