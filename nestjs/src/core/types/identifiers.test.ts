import {
  serializeNumericId,
  serializeUuidId,
  toCourseId,
  toCourseLeaveSurveyResponseId,
  toResumeId,
  toUserId,
} from './identifiers';

describe('numeric identifiers', () => {
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN])('should reject invalid input %s', value => {
    expect(() => toUserId(value)).toThrow('UserId must be a safe positive integer');
  });

  it('should construct and serialize a valid ID', () => {
    expect(serializeNumericId(toCourseId(1))).toBe(1);
  });
});

describe('UUID identifiers', () => {
  const uuidV4 = '550e8400-e29b-41d4-a716-446655440000';

  it.each(['', 'not-a-uuid', '550e8400-e29b-11d4-a716-446655440000', '550e8400-e29b-41d4-7716-446655440000'])(
    'should reject invalid input %s',
    value => {
      expect(() => toResumeId(value)).toThrow('ResumeId must be a UUID version 4');
    },
  );

  it('should construct and serialize a valid UUID', () => {
    expect(serializeUuidId(toCourseLeaveSurveyResponseId(uuidV4))).toBe(uuidV4);
  });
});
