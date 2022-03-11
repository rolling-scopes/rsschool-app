import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDiscordServerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  gratitudeUrl: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  mentorsChatUrl: string;
}
