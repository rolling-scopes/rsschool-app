import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

export type ChannelType = 'tg' | 'email';

@Entity()
@Unique(['channelValue', 'username'])
export class Consent {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  channelValue: string;

  @Column()
  channelType: ChannelType;

  @Column()
  optIn: boolean;

  @Column({nullable: true})
  username?: string;
}
