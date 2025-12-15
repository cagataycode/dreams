import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DreamsService } from './dreams.service';
import { CreateDreamDto, UpdateDreamDto } from './dreams.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dreams')
@UseGuards(AuthGuard)
export class DreamsController {
  constructor(private readonly dreamsService: DreamsService) {}

  @Post()
  async createDream(@Request() req, @Body() createDreamDto: CreateDreamDto) {
    const userId = req.user.id;
    return this.dreamsService.createDream(userId, createDreamDto);
  }

  @Get('test-auth')
  async testAuth(@Request() req) {
    return {
      authenticated: true,
      user: req.user,
      message: 'Authentication working!'
    };
  }

  @Get()
  async getUserDreams(@Request() req) {
    const userId = req.user.id;
    return this.dreamsService.getUserDreams(userId);
  }

  @Get(':id')
  async getDream(@Request() req, @Param('id') dreamId: string) {
    const userId = req.user.id;
    return this.dreamsService.getDream(dreamId, userId);
  }

  @Put(':id')
  async updateDream(
    @Request() req,
    @Param('id') dreamId: string,
    @Body() updateDreamDto: UpdateDreamDto,
  ) {
    const userId = req.user.id;
    return this.dreamsService.updateDream(dreamId, userId, updateDreamDto);
  }

  @Delete(':id')
  async deleteDream(@Request() req, @Param('id') dreamId: string) {
    const userId = req.user.id;
    await this.dreamsService.deleteDream(dreamId, userId);
    return { message: 'Dream deleted successfully' };
  }
}