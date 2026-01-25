import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import {
  AuditAction,
  EntityType,
  RestDayRule,
  RestDayScheduleType,
} from '@prisma/client';
import { CreateRestDayRuleDto, UpdateRestDayRuleDto } from './rest-day.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RestDayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getRestDayRules(branchId: UUID): Promise<RestDayRule[]> {
    try {
      return this.prisma.restDayRule.findMany({
        where: {
          branchId,
          deletedAt: null,
          isCurrentVersion: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getRestDayRuleById(id: UUID): Promise<RestDayRule | null> {
    try {
      return this.prisma.restDayRule.findUnique({
        where: { id, deletedAt: null },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isExist(id: UUID): Promise<boolean> {
    try {
      const rule = await this.prisma.restDayRule.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });
      return Boolean(rule);
    } catch (error) {
      handleError(error);
    }
  }

  async isRestDay(userId: UUID, date: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          branchId: true,
          departmentId: true,
        },
      });

      if (!user || !user.branchId) {
        return false;
      }

      const dateObj = new Date(date);

      // Get applicable rules with priority: user > department > branch
      const rules = await this.prisma.restDayRule.findMany({
        where: {
          isCurrentVersion: true,
          deletedAt: null,
          effectiveFrom: { lte: dateObj },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: dateObj } }],
          AND: [
            {
              OR: [
                { userId: userId },
                { departmentId: user.departmentId },
                {
                  branchId: user.branchId,
                  userId: null,
                  departmentId: null,
                },
              ],
            },
          ],
        },
        orderBy: [
          // User-specific first, then department, then branch
          { userId: 'desc' },
          { departmentId: 'desc' },
        ],
      });

      if (rules.length === 0) {
        return false;
      }

      // Use highest priority rule
      const rule = rules[0];
      return this.evaluateRestDayRule(rule, date);
    } catch (error) {
      handleError(error);
    }
  }

  private evaluateRestDayRule(rule: RestDayRule, date: string): boolean {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    if (rule.scheduleType === RestDayScheduleType.FIXED_WEEKLY) {
      return rule.fixedDays.includes(dayOfWeek);
    }

    // ROTATING schedule
    if (rule.scheduleType === RestDayScheduleType.ROTATING) {
      if (!rule.patternStartDate || !rule.workDays || !rule.restDays) {
        return false;
      }

      const patternStart = new Date(rule.patternStartDate);
      const daysDiff = Math.floor(
        (dateObj.getTime() - patternStart.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Handle negative days (date before pattern start)
      if (daysDiff < 0) {
        return false;
      }

      const cycleLength = rule.workDays + rule.restDays;
      const positionInCycle = daysDiff % cycleLength;

      // Rest days are at the end of each cycle
      return positionInCycle >= rule.workDays;
    }

    return false;
  }

  async getUserRestDayRules(userId: UUID): Promise<RestDayRule[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          branchId: true,
          departmentId: true,
        },
      });

      if (!user) {
        return [];
      }

      return this.prisma.restDayRule.findMany({
        where: {
          isCurrentVersion: true,
          deletedAt: null,
          OR: [
            { userId: userId },
            { departmentId: user.departmentId },
            {
              branchId: user.branchId,
              userId: null,
              departmentId: null,
            },
          ],
        },
        orderBy: [{ userId: 'desc' }, { departmentId: 'desc' }],
      });
    } catch (error) {
      handleError(error);
    }
  }

  async create(data: CreateRestDayRuleDto, userId: UUID): Promise<RestDayRule> {
    try {
      // Validate at least one scope is provided
      if (!data.branchId && !data.departmentId && !data.userId) {
        throw new BadRequestException(
          'At least one of branchId, departmentId, or userId must be provided',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        // Check if there's an existing current version for the same scope
        const existing = await tx.restDayRule.findFirst({
          where: {
            isCurrentVersion: true,
            deletedAt: null,
            branchId: data.branchId ?? null,
            departmentId: data.departmentId ?? null,
            userId: data.userId ?? null,
          },
        });

        // If exists, end its effective period
        if (existing) {
          await tx.restDayRule.update({
            where: { id: existing.id },
            data: {
              effectiveTo: new Date(data.effectiveFrom),
              isCurrentVersion: false,
            },
          });
        }

        const rule = await tx.restDayRule.create({
          data: {
            name: data.name,
            scheduleType: data.scheduleType,
            fixedDays: data.fixedDays ?? [],
            workDays: data.workDays,
            restDays: data.restDays,
            patternStartDate: data.patternStartDate,
            branchId: data.branchId,
            departmentId: data.departmentId,
            userId: data.userId,
            effectiveFrom: new Date(data.effectiveFrom),
            effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
            previousVersionId: existing?.id,
            createdBy: userId,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.REST_DAY_RULE,
          entityId: rule.id,
          action: AuditAction.CREATE,
          performedBy: userId,
          afterSnapshot: rule,
        });

        return rule;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    id: UUID,
    data: UpdateRestDayRuleDto,
    userId: UUID,
  ): Promise<RestDayRule> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.restDayRule.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Rest day rule not found');
        }

        // Create new version
        await tx.restDayRule.update({
          where: { id },
          data: {
            effectiveTo: new Date(),
            isCurrentVersion: false,
          },
        });

        const newRule = await tx.restDayRule.create({
          data: {
            name: data.name ?? existing.name,
            scheduleType: data.scheduleType ?? existing.scheduleType,
            fixedDays: data.fixedDays ?? existing.fixedDays,
            workDays: data.workDays ?? existing.workDays,
            restDays: data.restDays ?? existing.restDays,
            patternStartDate: data.patternStartDate ?? existing.patternStartDate,
            branchId: data.branchId ?? existing.branchId,
            departmentId: data.departmentId ?? existing.departmentId,
            userId: data.userId ?? existing.userId,
            effectiveFrom: data.effectiveFrom
              ? new Date(data.effectiveFrom)
              : new Date(),
            effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
            version: existing.version + 1,
            previousVersionId: existing.id,
            createdBy: existing.createdBy,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.REST_DAY_RULE,
          entityId: newRule.id,
          action: AuditAction.UPDATE,
          performedBy: userId,
          beforeSnapshot: existing,
          afterSnapshot: newRule,
        });

        return newRule;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async delete(id: UUID, userId: UUID): Promise<RestDayRule> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.restDayRule.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Rest day rule not found');
        }

        const deleted = await tx.restDayRule.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.REST_DAY_RULE,
          entityId: id,
          action: AuditAction.DELETE,
          performedBy: userId,
          beforeSnapshot: existing,
        });

        return deleted;
      });
    } catch (error) {
      handleError(error);
    }
  }
}
