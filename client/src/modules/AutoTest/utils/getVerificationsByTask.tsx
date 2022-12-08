import { Verification } from 'services/course';


export function getVerificationsByTask(verifications: Verification[], courseTaskId: number): Verification[] {
  return verifications.filter(v => v.courseTaskId === courseTaskId);
}
