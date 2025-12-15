import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InterpretationsService } from './interpretations.service';
import {
  CreateInterpretationDto,
  CreateCollectiveAnalysisDto,
} from './interpretations.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PsychoanalystType } from './prompts';

@Controller('interpretations')
@UseGuards(AuthGuard)
export class InterpretationsController {
  constructor(
    private readonly interpretationsService: InterpretationsService,
  ) {}

  @Post()
  async createInterpretation(
    @Request() req,
    @Body() createDto: CreateInterpretationDto,
  ) {
    const userId = req.user.id;
    return this.interpretationsService.createInterpretation(userId, createDto);
  }

  @Post('collective')
  async createCollectiveAnalysis(
    @Request() req,
    @Body() createDto: CreateCollectiveAnalysisDto,
  ) {
    const userId = req.user.id;
    return this.interpretationsService.createCollectiveAnalysis(
      userId,
      createDto,
    );
  }

  @Get('collective')
  async getCollectiveAnalyses(@Request() req) {
    const userId = req.user.id;
    return this.interpretationsService.getCollectiveAnalyses(userId);
  }

  @Delete('collective/:id')
  async deleteCollectiveAnalysis(
    @Request() req,
    @Param('id') analysisId: string,
  ) {
    const userId = req.user.id;
    await this.interpretationsService.deleteCollectiveAnalysis(
      analysisId,
      userId,
    );
    return { message: 'Collective analysis deleted successfully' };
  }

  @Get('dream/:dreamId')
  async getDreamInterpretations(
    @Request() req,
    @Param('dreamId') dreamId: string,
  ) {
    const userId = req.user.id;
    return this.interpretationsService.getDreamInterpretations(dreamId, userId);
  }

  @Get('dream/:dreamId/type/:type')
  async getInterpretationByType(
    @Request() req,
    @Param('dreamId') dreamId: string,
    @Param('type') type: PsychoanalystType,
  ) {
    const userId = req.user.id;
    return this.interpretationsService.getInterpretationByDreamAndType(
      dreamId,
      type,
      userId,
    );
  }

  @Get()
  async getUserInterpretations(@Request() req) {
    const userId = req.user.id;
    return this.interpretationsService.getUserInterpretations(userId);
  }

  @Delete(':id')
  async deleteInterpretation(
    @Request() req,
    @Param('id') interpretationId: string,
  ) {
    const userId = req.user.id;
    await this.interpretationsService.deleteInterpretation(
      interpretationId,
      userId,
    );
    return { message: 'Interpretation deleted successfully' };
  }
}
