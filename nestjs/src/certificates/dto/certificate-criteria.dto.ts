import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber, IsOptional, Min, ValidateIf } from 'class-validator';

export class CertificateCriteriaDto {
  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  public courseTaskIds?: number[];

  @ApiProperty({
    required: false,
    description: 'Required if courseTaskIds is non-empty: minimum score per task',
  })
  @ValidateIf(o => Array.isArray(o.courseTaskIds) && o.courseTaskIds.length > 0)
  @IsNumber()
  @Min(0)
  public minScore?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  public minTotalScore: number;
}
