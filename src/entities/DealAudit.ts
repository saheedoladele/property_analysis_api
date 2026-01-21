import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('deal_audits')
export class DealAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_email', type: 'varchar' })
  userEmail!: string;

  @Column({ name: 'user_name', type: 'varchar' })
  userName!: string;

  @Column({ name: 'user_phone', type: 'varchar', nullable: true })
  userPhone?: string;

  @Column({ name: 'property_address', type: 'varchar' })
  propertyAddress!: string;

  @Column({ name: 'property_postcode', type: 'varchar' })
  propertyPostcode!: string;

  @Column({ name: 'asking_price', type: 'varchar', nullable: true })
  askingPrice?: string;

  @Column({ name: 'additional_notes', type: 'text', nullable: true })
  additionalNotes?: string;

  @Column({ name: 'booking_date', type: 'timestamp', nullable: true })
  bookingDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
