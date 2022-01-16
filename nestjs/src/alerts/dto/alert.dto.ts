export class AlertDto {
  id: number;
  type: string;
  text: string;
  enabled: boolean;
  courseId: number | null;
  updatedDate: string;
  createdDate: string;
}
