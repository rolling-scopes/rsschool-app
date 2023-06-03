import { Column, Index, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@Index(['repositoryUrl'])
@Index(['githubId'])
export class RepositoryEvent {
  @PrimaryGeneratedColumn() id: number;

  @Column()
  repositoryUrl: string;

  @Column()
  action: string;

  @Column()
  githubId: string;

  @Column({ nullable: true })
  userId?: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}
