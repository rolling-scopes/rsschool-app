import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['chatId'])
export class Consent {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  chatId: number;

  @Column()
  username: string;

  @Column()
  tg: boolean;

  @Column()
  email: boolean;
}
