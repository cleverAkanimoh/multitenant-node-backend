import {
  Table,
  Column,
  Model,
  CreatedAt,
  PrimaryKey,
  AutoIncrement,
  Unique,
} from "sequelize-typescript";

@Table
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Unique
  @Column
  username!: string;

  @Unique
  @Column
  email!: string;

  @Column
  password!: string;

  @CreatedAt
  @Column
  createdAt!: Date;
}
