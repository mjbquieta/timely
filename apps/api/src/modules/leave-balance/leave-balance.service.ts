import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import {
  AuditAction,
  EntityType,
  LeaveBalance,
  LeaveType,
} from '@prisma/client';
import {
  CreateLeaveBalanceDto,
  UpdateLeaveBalanceDto,
} from './leave-balance.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LeaveBalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getMyBalances(userId: UUID, year?: number): Promise<LeaveBalance[]> {
    try {
      const currentYear = year || new Date().getFullYear();

      return this.prisma.leaveBalance.findMany({
        where: {
          userId,
          year: currentYear,
        },
        orderBy: { leaveType: 'asc' },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getBalancesByBranch(
    branchId: UUID,
    year?: number,
  ): Promise<LeaveBalance[]> {
    try {
      const currentYear = year || new Date().getFullYear();

      return this.prisma.leaveBalance.findMany({
        where: {
          branchId,
          year: currentYear,
        },
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: [{ user: { profile: { name: 'asc' } } }, { leaveType: 'asc' }],
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getUserBalances(
    userId: UUID,
    year?: number,
  ): Promise<LeaveBalance[]> {
    try {
      const currentYear = year || new Date().getFullYear();

      return this.prisma.leaveBalance.findMany({
        where: {
          userId,
          year: currentYear,
        },
        orderBy: { leaveType: 'asc' },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async create(
    branchId: UUID,
    data: CreateLeaveBalanceDto,
    performedBy: UUID,
  ): Promise<LeaveBalance> {
    try {
      // Check if balance already exists
      const existing = await this.prisma.leaveBalance.findUnique({
        where: {
          userId_leaveType_year: {
            userId: data.userId,
            leaveType: data.leaveType,
            year: data.year,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Leave balance for ${data.leaveType} in ${data.year} already exists for this user`,
        );
      }

      return this.prisma.$transaction(async (tx) => {
        const balance = await tx.leaveBalance.create({
          data: {
            userId: data.userId,
            branchId,
            leaveType: data.leaveType,
            year: data.year,
            totalAllowance: data.totalAllowance,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.LEAVE_BALANCE,
          entityId: balance.id,
          action: AuditAction.CREATE,
          performedBy,
          afterSnapshot: balance,
        });

        return balance;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    id: UUID,
    data: UpdateLeaveBalanceDto,
    performedBy: UUID,
  ): Promise<LeaveBalance> {
    try {
      const existing = await this.prisma.leaveBalance.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new BadRequestException('Leave balance not found');
      }

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.leaveBalance.update({
          where: { id },
          data,
        });

        await this.auditService.log(tx, {
          entityType: EntityType.LEAVE_BALANCE,
          entityId: id,
          action: AuditAction.UPDATE,
          performedBy,
          beforeSnapshot: existing,
          afterSnapshot: updated,
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async initializeBalancesForUser(
    branchId: UUID,
    userId: UUID,
    year: number,
    performedBy: UUID,
  ): Promise<LeaveBalance[]> {
    try {
      // Default allowances per leave type
      const defaultAllowances: Record<LeaveType, number> = {
        VL: 15,
        SL: 15,
        EL: 3,
        ML: 105,
        PL: 7,
        LWOP: 0,
      };

      const createdBalances: LeaveBalance[] = [];

      for (const [leaveType, allowance] of Object.entries(defaultAllowances)) {
        // Skip if already exists
        const existing = await this.prisma.leaveBalance.findUnique({
          where: {
            userId_leaveType_year: {
              userId,
              leaveType: leaveType as LeaveType,
              year,
            },
          },
        });

        if (!existing) {
          const balance = await this.create(
            branchId,
            {
              userId,
              leaveType: leaveType as LeaveType,
              year,
              totalAllowance: allowance,
            },
            performedBy,
          );
          createdBalances.push(balance);
        }
      }

      return createdBalances;
    } catch (error) {
      handleError(error);
    }
  }

  async getBalanceSummary(
    userId: UUID,
    year?: number,
  ): Promise<{
    balances: LeaveBalance[];
    summary: {
      totalAllowance: number;
      totalUsed: number;
      totalPending: number;
      totalAvailable: number;
    };
  }> {
    try {
      const currentYear = year || new Date().getFullYear();
      const balances = await this.prisma.leaveBalance.findMany({
        where: {
          userId,
          year: currentYear,
        },
      });

      const summary = balances.reduce(
        (acc, balance) => {
          // Exclude LWOP from summary calculations
          if (balance.leaveType !== 'LWOP') {
            acc.totalAllowance += balance.totalAllowance;
            acc.totalUsed += balance.usedDays;
            acc.totalPending += balance.pendingDays;
          }
          return acc;
        },
        {
          totalAllowance: 0,
          totalUsed: 0,
          totalPending: 0,
          totalAvailable: 0,
        },
      );

      summary.totalAvailable =
        summary.totalAllowance - summary.totalUsed - summary.totalPending;

      return { balances, summary };
    } catch (error) {
      handleError(error);
    }
  }
}
