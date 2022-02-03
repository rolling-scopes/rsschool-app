import { Entity, Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { Notification } from '.';
import { NotificationChannel } from './notificationChannel';

@Entity()
export class NotificationChannelSettings {
  @ManyToOne(_ => Notification, notification => notification.channels, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  notification: Notification;

  @PrimaryColumn()
  @Index()
  notificationId: string;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => NotificationChannel, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  channel: NotificationChannel;

  @PrimaryColumn()
  channelId: string;

  @Column({ type: 'simple-json', nullable: true })
  template: EmailTemplate | TelegramTemplate;
}

type EmailTemplate = {
  subject: string;
  body: string;
};

type TelegramTemplate = {
  body: string;
};
