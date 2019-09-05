import { uniq } from 'lodash';

const LANGUAGE = 'javascript';

export default (data: any[]) => {
  const answers = data
    .filter((task: any) => task.completedLanguages.includes(LANGUAGE))
    .map(({ slug }: { slug: string }) => slug);

  return uniq(answers);
};
