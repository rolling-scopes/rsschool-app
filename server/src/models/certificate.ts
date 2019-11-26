import {
  Entity,
  JoinColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student';

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: string;

  @Column()
  publicId: string;

  @Column()
  studentId: number;

  @OneToOne(
    () => Student,
    student => student.certificate,
  )
  @JoinColumn()
  student: Student;

  @Column({ default: 'rsschool-certificates' })
  s3Bucket: string;

  @Column()
  s3Key: string;

  @Column({ type: 'timestamptz' })
  issueDate: Date;
}
