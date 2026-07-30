import { Controller, Get, Request } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('events/analysis')
  async analyze(@Request() req) {
    const userId = req.user.sub;
    return this.analysisService.analyzeForUser(userId);
  }
}
