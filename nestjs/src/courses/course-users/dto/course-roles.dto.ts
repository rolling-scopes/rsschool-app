import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CourseRolesDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isManager: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isSupervisor: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isDementor: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isActivist: boolean;
}
