import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import { OvertimePolicy } from '@prisma/client';
import {
  CreateOvertimePolicyDto,
  UpdateOvertimePolicyDto,
} from './overtime-policy.dto';

@Injectable()
export class OvertimePolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async getByBranch(branchId: UUID): Promise<OvertimePolicy | null> {
    try {
      return this.prisma.overtimePolicy.findUnique({
        where: { branchId },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async createOrUpdate(
    branchId: UUID,
    data: CreateOvertimePolicyDto | UpdateOvertimePolicyDto,
  ): Promise<OvertimePolicy> {
    try {
      return this.prisma.overtimePolicy.upsert({
        where: { branchId },
        create: {
          branchId,
          maxDailyOtMinutes: (data as CreateOvertimePolicyDto).maxDailyOtMinutes || 240,
          maxWeeklyOtMinutes: (data as CreateOvertimePolicyDto).maxWeeklyOtMinutes || 480,
        },
        update: data,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async delete(branchId: UUID): Promise<OvertimePolicy> {
    try {
      return this.prisma.overtimePolicy.delete({
        where: { branchId },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
