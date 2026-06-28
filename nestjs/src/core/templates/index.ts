import handlebars from 'handlebars';
import { formatInTimeZone } from 'date-fns-tz';

handlebars.registerHelper('truncate', (string: string, options: { maxLength: number }) => {
  const { maxLength = 50 } = options || {};
  if (string.length > maxLength) {
    return `${string.slice(0, maxLength)}...`;
  }
  return string;
});

handlebars.registerHelper('capitalize', (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
});

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('formatDateTime', (dateTime: string) => {
  if (!dateTime) return '';
  return formatInTimeZone(dateTime, 'UTC', 'yyyy-MM-dd HH:mm');
});
