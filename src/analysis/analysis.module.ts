import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { GroqClient } from './groq.client';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, GroqClient],
})
export class AnalysisModule {}
