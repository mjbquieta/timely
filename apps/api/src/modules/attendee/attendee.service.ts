import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { UUID } from 'crypto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import {
  CreateAttendeeUserWithPasswordDto,
  PartialUserDto,
  UserNonWorkingDto,
} from '../user/user.dto';
import {
  AttendanceStatus,
  HasConsole,
  User,
  UserProfile,
  UserType,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { handleError } from 'src/common/exceptions/filter.exception';
import { toZonedTime } from 'date-fns-tz';
import { createDateRangeFilter } from 'src/common/utils/date.util';
import { format } from 'date-fns';
import { BranchService } from '../branch/branch.service';
import { AllowConsoleAccessDto } from './attendee.dto';

@Injectable()
export class AttendeeService implements OnModuleInit {
  private saltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.saltRounds = Number(this.configService.get('SALT_ROUNDS'));
  }

  async isExist(id: UUID) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return !!user;
  }

  async findProfile(id: UUID) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, deletedAt: null },
        include: {
          profile: true,
          branch: {
            include: {
              company: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async findByBranch(branchId: UUID) {
    try {
      const attendees = await this.prisma.user.findMany({
        where: {
          branchId,
          deletedAt: null,
          type: {
            has: UserType.ATTENDEE,
          },
        },
        include: {
          profile: true,
          department: {
            include: {
              shift: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return attendees;
    } catch (error) {
      handleError(error);
    }
  }

  async findAttendance(id: UUID) {
    try {
      return this.prisma.attendance.findMany({
        where: { userId: id, deletedAt: null },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async createByBranch(
    branchId: UUID,
    data: CreateAttendeeUserWithPasswordDto,
  ) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);
      const user = await this.prisma.user.create({
        data: {
          type: [UserType.ATTENDEE],
          branchId,
          profile: {
            create: {
              ...omit(data, ['password']),
              password: hashedPassword,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async update(id: UUID, data: PartialUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          profile: {
            update: data,
          },
        },
        include: {
          profile: true,
        },
      });

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async delete(id: UUID) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
        include: {
          profile: true,
        },
      });

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async getCounts(branchId: UUID, timezone: string) {
    try {
      const attendees = await this.prisma.user.count({
        where: { branchId, deletedAt: null, type: { has: UserType.ATTENDEE } },
      });

      const today = format(new Date(), 'yyyy-MM-dd');
      const dateRange = createDateRangeFilter(today, today, timezone);

      const attendances = await this.prisma.attendance.groupBy({
        by: ['userId'],
        where: {
          branchId,
          deletedAt: null,
          time: {
            gte: dateRange.gte,
            lt: dateRange.lte,
          },
        },
        _count: {
          userId: true,
        },
      });

      const presentAttendees = attendances.length;

      const absentAttendees = await this.prisma.userNonWorkingStatus.count({
        where: {
          status: AttendanceStatus.ABSENT,
          date: format(toZonedTime(new Date(), timezone), 'yyyy-MM-dd'),
        },
      });

      return {
        totalAttendees: attendees,
        presentAttendees,
        absentAttendees,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async isUserHasDepartment(userId: UUID, branchId: UUID): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
          branchId,
          deletedAt: null,
          departmentId: null,
        },
        select: { departmentId: true },
      });

      return Boolean(user);
    } catch (error) {
      handleError(error);
    }
  }

  async tagAsNonWorking(
    branchId: UUID,
    attendeeId: UUID,
    payload: UserNonWorkingDto,
  ) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });

      const dateRange = createDateRangeFilter(
        payload.date,
        payload.date,
        branch.timezone,
      );
      return this.prisma.$transaction(async (tx) => {
        const nonWorkingStatus = await tx.userNonWorkingStatus.findFirst({
          where: {
            userId: attendeeId,
            date: payload.date,
          },
        });

        if (nonWorkingStatus) {
          await tx.userNonWorkingStatus.create({
            data: {
              ...payload,
              userId: attendeeId,
              timezone: branch.timezone,
            },
          });
        }

        await tx.attendance.updateMany({
          where: {
            userId: attendeeId,
            time: dateRange,
          },
          data: { status: payload.status },
        });

        return nonWorkingStatus;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async allowConsoleAccess(
    userId: UUID,
    data: AllowConsoleAccessDto,
  ): Promise<User & { profile: Omit<UserProfile, 'user' | 'password'> }> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          hasConsole: HasConsole.ALLOWED,
          profile: { update: { password: hashedPassword, email: data.email } },
        },
        include: {
          profile: true,
        },
      });

      return omit(user, ['profile.password']) as User & {
        profile: Omit<UserProfile, 'user' | 'password'>;
      };
    } catch (error) {
      handleError(error);
    }
  }

  async revokeConsoleAccess(userId: UUID) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { hasConsole: HasConsole.REVOKED },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
