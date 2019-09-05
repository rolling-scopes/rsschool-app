
import commandFlow from '../helpers/command-flow';
import { updateScores } from '../utils/rsschool-api-utils';

export default commandFlow(async (scores: any) => {
  console.log('\nStage: updating scores');
  const updateResult = await updateScores(JSON.stringify(scores));

  const statusMap: Map<string, number> = new Map();

  updateResult.data
    .forEach(({ status }: any) => {
      if (statusMap.has(status)) {
        const currentStatus = statusMap.get(status)!;
        statusMap.set(status, currentStatus + 1);
      } else {
        statusMap.set(status, 1);
      }
    });

  console.log('\nUpdating status:');
  statusMap
    .forEach((value, status) => console.log(`:: ${status.toUpperCase()} ${value} records`));
  console.log(`Total: ${updateResult.data.length}`);
});
