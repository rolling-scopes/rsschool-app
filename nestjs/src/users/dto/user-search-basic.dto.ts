import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';
import { UsersService } from '../users.service';

export class UserSearchBasicDto {
  constructor(user: User) {
    this.id = user.id;
    this.githubId = user.githubId;
    this.name = UsersService.getFullName({ firstName: user.firstName, lastName: user.lastName });
    this.discord = user.discord ? `${user.discord.username}#${user.discord.discriminator}` : null;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  githubId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  discord: string | null;
}
