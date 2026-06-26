import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { StudentId } from './student-id.decorator';

type ParamFactory = (data: unknown, ctx: ExecutionContext) => unknown;

// `createParamDecorator` hides its factory; recover it from the route-args metadata
// it writes when the decorator is applied to a parameter.
const getParamDecoratorFactory = (decorator: () => ParameterDecorator): ParamFactory => {
  class TestController {
    public test(@decorator() _value: unknown) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'test');
  const key = Object.keys(args)[0];
  return args[key].factory as ParamFactory;
};

const buildContext = (request: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as unknown as ExecutionContext;

describe('StudentId decorator', () => {
  const factory = getParamDecoratorFactory(StudentId);

  it('returns the studentId for the matched course', () => {
    const ctx = buildContext({
      params: { courseId: '5' },
      user: { courses: { 5: { studentId: 123 } } },
    });

    expect(factory(undefined, ctx)).toBe(123);
  });

  it('returns undefined when the user is not enrolled in the course (optional chaining)', () => {
    const ctx = buildContext({
      params: { courseId: '5' },
      user: { courses: { 7: { studentId: 123 } } },
    });

    expect(factory(undefined, ctx)).toBeUndefined();
  });

  it('returns undefined when the matched course has no studentId', () => {
    const ctx = buildContext({
      params: { courseId: '5' },
      user: { courses: { 5: {} } },
    });

    expect(factory(undefined, ctx)).toBeUndefined();
  });

  it('reads the courseId from the request params', () => {
    const ctx = buildContext({
      params: { courseId: '42' },
      user: { courses: { 42: { studentId: 999 }, 5: { studentId: 1 } } },
    });

    expect(factory(undefined, ctx)).toBe(999);
  });
});
