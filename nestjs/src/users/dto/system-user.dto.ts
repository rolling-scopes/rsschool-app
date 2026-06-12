import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';

export class SystemUserDto {
  @ApiProperty()
  public id: number;

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public createdDate: string;

  constructor(user: User) {
    this.id = user.id;
    this.githubId = user.githubId;
    this.name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    this.createdDate = user.createdDate ? String(user.createdDate) : '';
  }
}
