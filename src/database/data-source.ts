import { DataSource } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import { EventEntity } from "./entities/event.entity";
import { EventType } from "./entities/eventtype.entity";
import { EmailTokenEntity } from "./entities/email_token.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQLHOST,
  port: parseInt(process.env.MYSQLPORT!),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.BDNAME,
  entities: [UserEntity, EventEntity, EventType, EmailTokenEntity],
});