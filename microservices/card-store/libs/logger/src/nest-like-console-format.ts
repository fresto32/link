import {Format} from 'logform';
import bare from 'cli-color/bare';
import {greenBright, red, yellow, magentaBright, cyanBright} from 'cli-color';
import {format} from 'winston';
import safeStringify from 'fast-safe-stringify';

const nestLikeColorScheme: Record<string, bare.Format> = {
  info: greenBright,
  error: red,
  warn: yellow,
  debug: magentaBright,
  verbose: cyanBright,
};

export const nestLikeConsoleFormat = (): Format =>
  format.printf(({context, level, timestamp, message, ...meta}) => {
    const color =
      nestLikeColorScheme[level] || ((text: string): string => text);

    return (
      ('undefined' !== typeof context
        ? `${yellow('[' + context + ']')} `
        : '') +
      `${color(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
      ('undefined' !== typeof timestamp
        ? `${new Date(timestamp).toLocaleString()} `
        : '') +
      `${color(message)} - ` +
      `${safeStringify(meta)}`
    );
  });
