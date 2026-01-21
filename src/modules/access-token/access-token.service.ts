import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { AccessTokenDto } from './access-token.dto';
import { UserService } from '../user/user.service';
import { AccessToken, PortalType } from '@prisma/client';

@Injectable()
export class AccessTokenService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(userId: UUID, data: AccessTokenDto): Promise<AccessToken> {
    try {
      const isExist = await this.userService.isExist(userId);

      if (!isExist) {
        throw new NotFoundException('User not found');
      }

      const existingTokens = await this.checkTokenUniqueness(
        data.accessToken,
        data.refreshToken,
      );
      if (existingTokens) {
        throw new BadRequestException(
          'Token collision detected. Please try again.',
        );
      }

      await this.invalidateExistingTokens(userId, data.portalType);

      const accessToken = await this.prisma.accessToken.create({
        data: {
          userId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          portalType: data.portalType,
          expiresAt: data.expiresAt,
        },
      });

      return accessToken;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private async checkTokenUniqueness(
    accessToken: string,
    refreshToken: string,
  ): Promise<boolean> {
    const existingAccessToken = await this.prisma.accessToken.findUnique({
      where: { accessToken },
    });

    const existingRefreshToken = await this.prisma.accessToken.findUnique({
      where: { refreshToken },
    });

    return !!(existingAccessToken || existingRefreshToken);
  }

  async invalidateExistingTokens(
    userId: UUID,
    portalType: PortalType,
  ): Promise<void> {
    await this.prisma.accessToken.updateMany({
      where: {
        userId,
        portalType,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
