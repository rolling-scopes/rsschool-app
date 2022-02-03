import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Notification, User } from '.';
import { NotificationChannel } from './notificationChannel';

@Entity()
@Index(['notificationId', 'userId'])
export class NotificationUserSettings {
  @ManyToOne(_ => Notification, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn([{ name: 'notificationId', referencedColumnName: 'id' }])
  notification: Notification;

  @PrimaryColumn()
  notificationId: string;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  enabled: boolean;

  @ManyToOne(_ => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(_ => NotificationChannel, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  channel: NotificationChannel;

  @PrimaryColumn()
  channelId: string;
}
