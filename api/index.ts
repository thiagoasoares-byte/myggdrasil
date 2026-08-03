import 'dotenv/config';
import 'reflect-metadata';
import { bootstrapNestApp } from '../src/bootstrap';

let appPromise: Promise<any> | undefined;

function getApp() {
  if (!appPromise) {
    appPromise = bootstrapNestApp().then((app) => app.getHttpAdapter().getInstance());
  }

  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}