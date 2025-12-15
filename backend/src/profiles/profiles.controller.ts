import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { SaveProfileDto, UpdateProfileSettingsDto } from './profiles.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('profiles')
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    const profile = await this.profilesService.getProfile(userId);
    return profile || { exists: false };
  }

  @Put('me')
  async saveProfile(@Request() req, @Body() saveProfileDto: SaveProfileDto) {
    const userId = req.user.id;
    return this.profilesService.saveProfile(userId, saveProfileDto);
  }

  @Patch('me/settings')
  async updateSettings(
    @Request() req,
    @Body() updateSettingsDto: UpdateProfileSettingsDto,
  ) {
    const userId = req.user.id;
    const profile = await this.profilesService.updateSettings(
      userId,
      updateSettingsDto.include_in_interpretations,
    );
    return profile || { exists: false };
  }

  @Delete('me')
  async deleteProfile(@Request() req) {
    const userId = req.user.id;
    await this.profilesService.deleteProfile(userId);
    return { message: 'Profile deleted successfully' };
  }
}
