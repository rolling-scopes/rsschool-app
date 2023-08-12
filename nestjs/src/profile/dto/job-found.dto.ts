import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class JobFoundDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @Expose()
  public jobFound: boolean;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  public jobFoundCompanyName?: string | null;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  public jobFoundOfficeLocation?: string | null;
}
