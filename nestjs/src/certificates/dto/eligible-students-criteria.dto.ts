import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsNumber, IsOptional, Min, ValidateIf, ValidateNested } from 'class-validator';
import { CertificateTaskCriteriaDto } from './create-certificate.dto';

export class EligibleStudentsCriteriaDto {
  @ApiProperty({
    required: false,
    type: [CertificateTaskCriteriaDto],
    description: 'Per-task minimum scores. Takes precedence over courseTaskIds/minScore when non-empty.',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CertificateTaskCriteriaDto)
  public taskCriteria?: CertificateTaskCriteriaDto[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Legacy flat form: every listed task shares the same minScore. Ignored when taskCriteria is given.',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  public courseTaskIds?: number[];

  @ApiProperty({
    required: false,
    description: 'Required if courseTaskIds is non-empty: minimum score per task',
  })
  @ValidateIf(o => !o.taskCriteria?.length && Array.isArray(o.courseTaskIds) && o.courseTaskIds.length > 0)
  @IsNumber()
  @Min(0)
  public minScore?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  public minTotalScore: number;
}
