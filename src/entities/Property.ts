import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User.js';
import { Analysis } from './Analysis.js';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar' })
  address!: string;

  @Column({ type: 'varchar' })
  postcode!: string;

  @Column({ name: 'property_type', type: 'varchar', nullable: true })
  propertyType?: string;

  @Column({ type: 'varchar', nullable: true })
  tenure?: string;

  @Column({ name: 'analysis_data', type: 'jsonb', nullable: true })
  analysisData?: Record<string, any>;

  @Column({ name: 'saved_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  savedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Analysis, (analysis) => analysis.property)
  analyses!: Analysis[];
}
