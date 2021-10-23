export class CreateAlertDto {
  type: string;
  text: string;
  enabled?: boolean;
  courseId?: number;
}
