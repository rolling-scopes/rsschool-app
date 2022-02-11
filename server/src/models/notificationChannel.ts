import { Entity, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class NotificationChannel {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}
