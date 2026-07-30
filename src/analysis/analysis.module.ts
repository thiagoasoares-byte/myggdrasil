import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { GeminiClient } from './gemini.client';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, GeminiClient],
})
export class AnalysisModule {}
