import { IsNotEmpty, IsString } from 'class-validator';

export class SaveDisciplineDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
