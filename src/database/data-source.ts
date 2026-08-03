import { DataSource } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import { EventEntity } from "./entities/event.entity";
import { EventType } from "./entities/eventtype.entity";
import { EventRelationshipEntity } from "./entities/eventrelationship.entity";
import { EmailTokenEntity } from "./entities/email_token.entity";
import { AnalysisCacheEntity } from "./entities/analysis_cache.entity";
import * as fs from "fs";

// Aiven (e a maioria dos MySQL gerenciados) exige SSL. Defina MYSQL_SSL=true
// no .env quando conectar num banco remoto; localhost continua sem SSL.
// MYSQL_SSL_CA (opcional) aponta pro caminho do certificado ca.pem baixado no
// painel do Aiven — sem ele, a conexão ainda funciona, só sem validar o certificado.
const sslEnabled = process.env.MYSQL_SSL === "true";
const sslCaPath = process.env.MYSQL_SSL_CA;
const ssl = sslEnabled
  ? {
      rejectUnauthorized: !!sslCaPath,
      ca: sslCaPath ? fs.readFileSync(sslCaPath).toString() : undefined,
    }
  : undefined;

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQLHOST,
  port: parseInt(process.env.MYSQLPORT!),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.BDNAME,
  entities: [UserEntity, EventEntity, EventType, EventRelationshipEntity, EmailTokenEntity, AnalysisCacheEntity],
  ssl,
});