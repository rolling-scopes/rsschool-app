import { JobPost, JobPostStatus, JobType } from '@entities/job-post';
import { ApiProperty } from '@nestjs/swagger';
import { PersonDto } from '../../core/dto';

export class JobPostDto {
  constructor(jobPost: JobPost) {
    this.id = jobPost.id;
    this.author = new PersonDto(jobPost.author);
    this.updatedDate = jobPost.updatedDate.toISOString();
    this.publishedDate = jobPost.publishedDate?.toISOString() ?? null;
    this.company = jobPost.company;
    this.description = jobPost.description;
    this.title = jobPost.title;
    this.url = jobPost.url ?? null;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public author: PersonDto;

  @ApiProperty()
  public updatedDate: string;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public url: string | null;

  @ApiProperty()
  public title: string;

  @ApiProperty()
  public company: string;

  @ApiProperty({ enum: JobType })
  public jobType: JobType;

  @ApiProperty({ enum: JobPostStatus })
  public status: JobPostStatus;

  @ApiProperty({ nullable: true, type: String })
  public publishedDate: string | null;
}
