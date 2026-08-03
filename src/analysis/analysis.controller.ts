import { Controller, Get, Query, Request } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('analysis')
  async analyze(@Request() req, @Query('force') force?: string) {
    const userId = req.user.sub;
    return this.analysisService.analyzeForUser(userId, force === 'true');
  }
}
