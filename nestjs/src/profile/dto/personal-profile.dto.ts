import { User } from '@entities/index';
import { ApiProperty } from '@nestjs/swagger';

export class PersonalProfileDto {
  constructor(user: User) {
    this.userId = user.id;
    this.githubId = user.githubId;
    this.primaryEmail = user.primaryEmail ?? null;
    this.isActiveStudent = user.students?.some(s => !s.isExpelled && !s.isFailed && s.totalScore > 0) ?? false;
  }

  @ApiProperty({ type: Number })
  public userId: number;

  @ApiProperty({ type: String })
  public githubId: string;

  @ApiProperty({ type: String, nullable: true })
  public primaryEmail: string | null;

  @ApiProperty({ type: Boolean })
  public isActiveStudent: boolean;
}
