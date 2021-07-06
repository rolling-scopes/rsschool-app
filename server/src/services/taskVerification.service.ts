import { TaskVerification } from '../models';
import { getRepository } from 'typeorm';

export async function cancelPendingTasks() {
  return getRepository(TaskVerification)
    .createQueryBuilder()
    .update()
    .set({ status: 'cancelled' })
    .where(`"updatedDate" + interval '1 hour' < now()::timestamp AND status = 'pending'`)
    .execute();
}
