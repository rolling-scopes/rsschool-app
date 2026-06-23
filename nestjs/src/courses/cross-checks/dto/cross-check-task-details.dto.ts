import { ApiProperty } from '@nestjs/swagger';
import { CrossCheckCriteriaData } from '@entities/taskSolutionResult';
import { CrossCheckCriteriaDataDto } from './cross-check-criteria-data.dto';

export class CrossCheckTaskDetailsDto {
  constructor(data: { criteria: CrossCheckCriteriaData[]; studentEndDate: string | Date | null | undefined }) {
    this.criteria = data.criteria as CrossCheckCriteriaDataDto[];
    this.studentEndDate = data.studentEndDate != null ? new Date(data.studentEndDate).toISOString() : undefined;
  }

  @ApiProperty({ type: [CrossCheckCriteriaDataDto] })
  public criteria: CrossCheckCriteriaDataDto[];

  @ApiProperty({ required: false, type: String })
  public studentEndDate?: string;
}
