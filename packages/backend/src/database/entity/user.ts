import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({ type: "jsonb" })
    roles!: string[];
}
