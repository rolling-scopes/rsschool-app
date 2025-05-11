import { ApiProperty } from '@nestjs/swagger';
import { AuthUser } from 'src/auth';
import { CourseRole } from '@entities/session';

export class AuthUserDto {
  constructor(readonly authUser: AuthUser) {
    this.id = authUser.id;
    this.githubId = authUser.githubId;
    this.roles = authUser.roles;
    this.isAdmin = authUser.isAdmin;
    this.isHirer = authUser.isHirer;
    this.appRoles = authUser.appRoles;
    this.courses = authUser.courses;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  githubId: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string', enum: ['mentor', 'student'] },
  })
  roles: Record<string, 'mentor' | 'student'>;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty()
  isHirer: boolean;

  @ApiProperty()
  appRoles: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              CourseRole.Manager,
              CourseRole.Supervisor,
              CourseRole.Student,
              CourseRole.Mentor,
              CourseRole.Dementor,
              CourseRole.Activist,
            ],
          },
        },
      },
      required: ['roles'],
    },
  })
  courses: Record<string, { roles: string[] }>;
}
