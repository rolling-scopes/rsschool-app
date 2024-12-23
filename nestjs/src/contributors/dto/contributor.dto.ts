import { Contributor } from '@entities/contributor';
import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';

export class ContributorUserDto {
  constructor(user: User) {
    this.id = user.id;
    this.githubId = user.githubId;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  githubId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class ContributorDto {
  constructor(contributor: Contributor) {
    this.id = contributor.id;
    this.description = contributor.description;
    this.createdDate = contributor.createdDate;
    this.updatedDate = contributor.updatedDate;

    this.user = new ContributorUserDto(contributor.user);
  }

  @ApiProperty()
  description: string;

  @ApiProperty({ type: () => ContributorUserDto })
  user: ContributorUserDto;

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public createdDate: string;

  @ApiProperty()
  public updatedDate: string;
}
