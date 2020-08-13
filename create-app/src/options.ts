import Debug from 'debug';

import { getOptionValue } from './cli';

const debug = Debug('@capacitor/create-app:options');

export type Options = {
  [K in keyof OptionValues]: string | undefined;
};

export interface OptionValues {
  name: string;
  'package-id': string;
  dir: string;
}

export type Validators = {
  [K in keyof OptionValues]: (value: any) => string | true;
};

export const OPTIONS: (keyof OptionValues)[] = ['name', 'package-id', 'dir'];
export const VALIDATORS: Validators = {
  name: value =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide an app name, e.g. "Spacebook"`
      : true,
  'package-id': value =>
    typeof value !== 'string' || value.trim().length === 0
      ? 'Must provide a Package ID, e.g. "com.example.app"'
      : /[A-Z]/.test(value)
      ? 'Must be lowercase'
      : /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(value)
      ? true
      : `Must be in reverse-DNS format, e.g. "com.example.app"`,
  dir: value =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a directory, e.g. "my-dir"`
      : true,
};

export const getOptions = (): Options =>
  OPTIONS.reduce((opts, option) => {
    const value = getOptionValue(process.argv, `--${option}`);
    const validatorResult = VALIDATORS[option](value);

    if (typeof validatorResult === 'string') {
      debug(`invalid option: --%s %O: %s`, option, value, validatorResult);
    }

    opts[option] = validatorResult === true ? value : undefined;

    return opts;
  }, {} as Options);
