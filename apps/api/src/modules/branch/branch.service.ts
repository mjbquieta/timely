import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { BranchChangePasswordDto, PartialBranchUserDto } from './branch.dto';
import { Branch, UserType } from '@prisma/client';
import { AttendeeService } from '../attendee/attendee.service';
import { omit } from 'lodash';
import * as bcrypt from 'bcrypt';
import { handleError } from 'src/common/exceptions/filter.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BranchService implements OnModuleInit {
  private readonly logger = new Logger(BranchService.name);
  private saltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly attendeeService: AttendeeService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.saltRounds = Number(this.configService.get('SALT_ROUNDS'));
    // this.accessTokenDuration = this.configService.get('ACCESS_TOKEN_DURATION');
    // this.refreshTokenDuration = this.configService.get(
    //   'REFRESH_TOKEN_DURATION',
    // );
  }

  async getAllBranches() {
    try {
      return this.prisma.branch.findMany({
        where: { deletedAt: null },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async isExist(id: UUID): Promise<boolean> {
    try {
      const branchExists = await this.prisma.branch.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });

      return Boolean(branchExists);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getBranchDetails(userId: UUID) {
    try {
      const [user, profile, branch] = await this.prisma.getUserProfile(userId);

      const counts = await this.attendeeService.getCounts(
        branch.id as UUID,
        branch.timezone,
      );

      return {
        user: omit(user, ['branch']),
        branch,
        counts: counts,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: UUID, data: PartialBranchUserDto) {
    try {
      const branch = await this.prisma.branch.update({
        where: { id, deletedAt: null },
        data,
      });

      return branch;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getBranchByDeviceSerialNumber(sn: string): Promise<Branch | null> {
    try {
      return this.prisma.branch.findUnique({
        where: { deviceSerialNumber: sn },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getBranchById(id: UUID): Promise<Branch | null> {
    try {
      return this.prisma.branch.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeDevice(id: UUID, userId: UUID, sn: string, password: string) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id },
        include: {
          users: {
            where: {
              deletedAt: null,
              type: { has: UserType.BRANCH_OWNER },
              id: userId,
            },
            include: {
              profile: true,
            },
            take: 1,
          },
        },
      });

      const user = branch.users[0];
      if (!user) {
        throw new UnauthorizedException('Branch owner not found');
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.profile.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (branch.deviceSerialNumber === sn) {
        return branch;
      }

      return this.prisma.branch.update({
        where: { id },
        data: { deviceSerialNumber: sn },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async changePassword(userId: UUID, data: BranchChangePasswordDto) {
    try {
      const { password: oldPassword, newPassword } = data;

      const users = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          profile: true,
        },
      });

      if (!users) {
        throw new UnauthorizedException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        users.profile.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const newHashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      return this.prisma.userProfile.update({
        where: { id: users.profile.id },
        data: { password: newHashedPassword },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async findByCompanyId(companyId: UUID) {
    try {
      return await this.prisma.branch.findMany({
        where: { companyId, deletedAt: null },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
