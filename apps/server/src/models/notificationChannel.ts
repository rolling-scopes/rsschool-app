import { Entity, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class NotificationChannel {
  @PrimaryColumn()
  id: NotificationChannelId;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}

export type NotificationChannelId = 'telegram' | 'email' | 'discord';
