import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CommentMentorRegistryDto {
  @IsString()
  @ApiProperty({ nullable: true, type: String })
  public comment: string;
}
