import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AlertType {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  text: string;

  @Column({ nullable: true })
  courseId: number;

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: AlertType.INFO })
  type: AlertType;
}
