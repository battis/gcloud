import cli from '@battis/qui-cli';
import * as core from '../core';

export async function input<T extends string>({
  arg,
  message,
  purpose,
  validate,
  ...rest
}: {
  arg?: string;
  message: string;
  purpose?: string;
  default?: string;
  validate: (value?: string) => boolean | string;
}) {
  return (
    (validate && validate(arg) === true && arg) ||
    (!validate && arg) ||
    (await cli.prompts.input({
      message: `${message}${core.pad(purpose)}`,
      ...rest
    }))
  );
}

export default input;
