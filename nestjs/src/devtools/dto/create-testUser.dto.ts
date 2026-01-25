import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestUserDto {
  @ApiProperty({ example: 'michaele_mccomas8d' })
  @IsString()
  @IsNotEmpty()
  github: string;

  @ApiProperty({ example: 'michaele_mccomas8d@placement.jg' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Michael' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'McComas' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
