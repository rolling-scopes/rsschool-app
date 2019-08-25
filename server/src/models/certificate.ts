import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @Column({ default: 'rsschool-certificates' })
  s3Bucket: string;

  @Column()
  s3Key: string;

  @Column({ type: 'timestamptz' })
  issueDate: Date;
}
