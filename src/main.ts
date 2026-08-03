require('dotenv').config(); 
import "reflect-metadata";
import { bootstrapNestApp } from './bootstrap';

async function bootstrap() { 
  const app = await bootstrapNestApp();
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
 