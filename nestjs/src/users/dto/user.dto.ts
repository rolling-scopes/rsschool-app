import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UserDto {
  constructor(user: { id: number; githubId: string; name: string }) {
    this.id = user.id;
    this.name = user.name;
    this.githubId = user.githubId;
  }

  @ApiProperty()
  @IsNumber()
  public id: number;

  @ApiProperty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsString()
  public githubId: string;
}
