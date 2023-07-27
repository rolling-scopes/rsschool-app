import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const StudentId = createParamDecorator((_: unknown, ctx: ExecutionContext): number => {
  const request = ctx.switchToHttp().getRequest();
  const courseId = request.params.courseId;
  return request.user.courses[courseId]?.studentId;
});
