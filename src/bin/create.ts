import chalk from 'chalk';
import _ from 'lodash';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { LeveldbCli } from '../index';

yargs(hideBin(process.argv))
  .command(
    'list [file]',
    'list all key and value',
    (yargs) => {
      return yargs.positional('file', {
        describe: 'leveldb file dir path',
        default: '',
        required: true,
        type: 'string',
      });
    },
    async (argv) => {
      const leveldb = new LeveldbCli({ filepath: argv.file, debug: false });
      const result = await leveldb.listAll();
      console.log(`${chalk.green(_.padEnd('key', 50, '-'))}|${chalk.green(_.padEnd('value', 100, '-'))}`);
      _.map(result, (value, key) => {
        console.log(`${chalk.green(_.padEnd(key, 50, ' '))}|${chalk.green(_.padEnd(value, 100, ' '))}`);
      });
    },
  )
  .command(
    'get [key] [file]',
    'get key value',
    (yargs) => {
      return yargs
        .positional('key', {
          describe: 'leveldb key',
          default: '',
          required: true,
          type: 'string',
        })
        .positional('file', {
          describe: 'leveldb file dir path',
          default: '',
          required: true,
          type: 'string',
        });
    },
    async (argv) => {
      const leveldb = new LeveldbCli({ filepath: argv.file, debug: false });
      const value = await leveldb.get(argv.key);
      console.log(`${chalk.green(_.padEnd('key', 50, '-'))}|${chalk.green(_.padEnd('value', 100, '-'))}`);
      console.log(`${chalk.green(_.padEnd(argv.key, 50, ' '))}|${chalk.green(_.padEnd(value, 100, ' '))}`);
    },
  )
  .command(
    'set [key] [value] [file]',
    'set key value',
    (yargs) => {
      return yargs
        .positional('key', {
          describe: 'leveldb key',
          default: '',
          required: true,
          type: 'string',
        })
        .positional('value', {
          describe: 'leveldb key value',
          default: '',
          required: true,
          type: 'string',
        })
        .positional('file', {
          describe: 'leveldb file dir path',
          default: '',
          required: true,
          type: 'string',
        });
    },
    async (argv) => {
      const leveldb = new LeveldbCli({ filepath: argv.file, debug: false });
      const oldValue = await leveldb.get(argv.key);
      let newValue = argv.value;
      if (oldValue.startsWith('\x01')) {
        newValue = `\x01${newValue}`;
      }
      await leveldb.set(argv.key, newValue);
      const value = await leveldb.get(argv.key);
      console.log(`oldValue: ${oldValue}, newValue: ${newValue}`);
      console.log(`${chalk.green(_.padEnd('key', 50, '-'))}|${chalk.green(_.padEnd('value', 100, '-'))}`);
      console.log(`${chalk.green(_.padEnd(argv.key, 50, ' '))}|${chalk.green(_.padEnd(value, 100, ' '))}`);
    },
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .parse();
