import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Discipline {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @CreateDateColumn({ name: 'created_date' })
  public createdDate: string;

  @UpdateDateColumn({ name: 'updated_date' })
  public updatedDate: string;

  @DeleteDateColumn({ name: 'deleted_date' })
  public deletedDate: string;

  @Column({ name: 'name' })
  public name: string;
}
