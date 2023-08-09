import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class JobFoundDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  public jobFound: boolean;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  public jobFoundCompanyName?: string | null;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  public jobFoundOfficeLocation?: string | null;
}
