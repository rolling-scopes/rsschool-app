import { Brand, brandValue, serializeBrand } from './brand';

type NumericId<Name extends string> = Brand<number, Name>;
type UuidId<Name extends string> = Brand<string, Name>;

const createNumericId = <Name extends string>(value: number, name: Name): NumericId<Name> => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a safe positive integer`);
  }
  return brandValue<number, Name>(value);
};

const createUuidId = <Name extends string>(value: string, name: Name, version: 4): UuidId<Name> => {
  const expression = new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, 'i');
  if (!expression.test(value)) {
    throw new TypeError(`${name} must be a UUID version ${version}`);
  }
  return brandValue<string, Name>(value);
};

export type UserId = NumericId<'UserId'>;
export type CourseId = NumericId<'CourseId'>;
export type StudentId = NumericId<'StudentId'>;
export type MentorId = NumericId<'MentorId'>;
export type TaskId = NumericId<'TaskId'>;
export type CourseTaskId = NumericId<'CourseTaskId'>;
export type RegistryId = NumericId<'RegistryId'>;
export type CertificateId = NumericId<'CertificateId'>;
export type TaskResultId = NumericId<'TaskResultId'>;
export type TeamId = NumericId<'TeamId'>;
export type DisciplineId = NumericId<'DisciplineId'>;
export type ResumeId = UuidId<'ResumeId'>;
export type CourseLeaveSurveyResponseId = UuidId<'CourseLeaveSurveyResponseId'>;

export const toUserId = (value: number): UserId => createNumericId(value, 'UserId');
export const toCourseId = (value: number): CourseId => createNumericId(value, 'CourseId');
export const toStudentId = (value: number): StudentId => createNumericId(value, 'StudentId');
export const toMentorId = (value: number): MentorId => createNumericId(value, 'MentorId');
export const toTaskId = (value: number): TaskId => createNumericId(value, 'TaskId');
export const toCourseTaskId = (value: number): CourseTaskId => createNumericId(value, 'CourseTaskId');
export const toRegistryId = (value: number): RegistryId => createNumericId(value, 'RegistryId');
export const toCertificateId = (value: number): CertificateId => createNumericId(value, 'CertificateId');
export const toTaskResultId = (value: number): TaskResultId => createNumericId(value, 'TaskResultId');
export const toTeamId = (value: number): TeamId => createNumericId(value, 'TeamId');
export const toDisciplineId = (value: number): DisciplineId => createNumericId(value, 'DisciplineId');
export const toResumeId = (value: string): ResumeId => createUuidId(value, 'ResumeId', 4);
export const toCourseLeaveSurveyResponseId = (value: string): CourseLeaveSurveyResponseId =>
  createUuidId(value, 'CourseLeaveSurveyResponseId', 4);

export const serializeNumericId = <Name extends string>(value: NumericId<Name>): number => serializeBrand(value);
export const serializeUuidId = <Name extends string>(value: UuidId<Name>): string => serializeBrand(value);
