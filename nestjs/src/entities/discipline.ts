import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Discipline {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @CreateDateColumn({ name: 'created_date' })
  public createdDate: string;

  @UpdateDateColumn({ name: 'updated_date' })
  public updatedDate: string;

  @Column({ name: 'name' })
  public name: string;

  @Column({ name: 'deleted', default: false })
  @Index()
  public deleted: boolean = false;
}
