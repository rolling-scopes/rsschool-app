import commandFlow from '../helpers/command-flow';

export default commandFlow((scores: any) => {
  const results = scores
    .map(({ studentGithubId, score }: any) => `${studentGithubId}: ${score}`)
    .join('\n');

  console.log('\nResults could be written to file/db:\n');
  console.log(results);
});
