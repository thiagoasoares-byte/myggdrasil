import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipAuth } from './decorators/publickey';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  sortDataMenor(): string {
    return this.appService.getHello();
  }

  @SkipAuth()
  @Get('healthz')
  healthCheck() {
    return { status: 'ok' };
  }
}
