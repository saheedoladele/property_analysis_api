import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";
import { Property } from "./Property.js";

@Entity("analyses")
export class Analysis {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "property_id", type: "uuid", nullable: true })
  propertyId?: string;

  @ManyToOne(() => Property, (property) => property.analyses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "property_id" })
  property?: Property;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.analyses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "analysis_data", type: "jsonb" })
  analysisData!: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
