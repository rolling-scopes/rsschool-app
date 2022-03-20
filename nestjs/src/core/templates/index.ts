import handlebars from 'handlebars';

handlebars.registerHelper('truncate', (string: string, options: { maxLength: number }) => {
  const { maxLength = 50 } = options || {};
  if (string.length > maxLength) {
    return `${string.slice(0, maxLength)}...`;
  }
  return string;
});
