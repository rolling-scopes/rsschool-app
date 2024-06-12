import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class InviteMentorsDto {
  @ApiProperty()
  @IsArray()
  disciplines: string[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isMentor?: boolean;

  @ApiProperty()
  @IsString()
  text: string;
}
