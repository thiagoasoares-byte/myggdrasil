import { DataSource } from "typeorm";
import { UserEntity } from "./entities/user.entity";

export const AppDataSource = new DataSource({
  type: "mysql", 
  host: process.env.MYSQLHOST, 
  port: parseInt(process.env.MYSQLPORT!),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.BDNAME,
  entities: [UserEntity]
})