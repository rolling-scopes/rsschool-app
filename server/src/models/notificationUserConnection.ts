import { Entity, Column, CreateDateColumn, PrimaryColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { NotificationChannel, User } from '.';
import { NotificationChannelId } from './notificationChannel';

@Entity()
export class NotificationUserConnection {
  @ManyToOne(() => User, user => user.notificationConnections, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate?: number;

  @ManyToOne(() => NotificationChannel, { onUpdate: 'CASCADE' })
  channel: NotificationChannel;

  @PrimaryColumn()
  channelId: NotificationChannelId;

  @PrimaryColumn()
  externalId: string;

  @Column({ default: true })
  enabled: boolean;
}
