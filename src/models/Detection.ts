import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Image } from './Image';

@Entity('detections')
export class Detection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  image_id!: number;

  @Column({
    type: 'enum',
    enum: ['夹杂物', '补丁', '划痕', '其他'],
  })
  defect_type!: string;

  @Column('float')
  confidence!: number;

  @Column('json')
  location!: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  @CreateDateColumn()
  detection_time!: Date;

  @ManyToOne(() => Image, { onDelete: 'CASCADE' })
  image!: Image;
} 