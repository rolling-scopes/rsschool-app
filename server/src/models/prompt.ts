import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['type'])
export class Prompt {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({ type: 'varchar', length: 256 })
  type: string;

  @Column()
  temperature: number;

  @Column()
  text: string;
}
