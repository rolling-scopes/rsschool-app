import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRepositoryEventDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  action: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  githubId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  repositoryUrl: string;
}
