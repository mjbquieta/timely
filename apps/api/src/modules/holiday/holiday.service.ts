import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import { AuditAction, EntityType, Holiday } from '@prisma/client';
import { CreateHolidayDto, UpdateHolidayDto } from './holiday.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HolidayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getHolidays(branchId: UUID): Promise<Holiday[]> {
    try {
      return this.prisma.holiday.findMany({
        where: {
          branchId,
          deletedAt: null,
          isCurrentVersion: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getHolidayById(id: UUID): Promise<Holiday | null> {
    try {
      return this.prisma.holiday.findUnique({
        where: { id, deletedAt: null },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isExist(id: UUID): Promise<boolean> {
    try {
      const holiday = await this.prisma.holiday.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });
      return Boolean(holiday);
    } catch (error) {
      handleError(error);
    }
  }

  async isHoliday(branchId: UUID, date: string): Promise<Holiday | null> {
    try {
      return this.prisma.holiday.findFirst({
        where: {
          branchId,
          deletedAt: null,
          isCurrentVersion: true,
          OR: [
            // Single day holiday
            { startDate: date, endDate: null },
            // Range holiday where date falls within
            {
              startDate: { lte: date },
              endDate: { gte: date },
            },
          ],
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async create(
    branchId: UUID,
    data: CreateHolidayDto,
    userId: UUID,
  ): Promise<Holiday> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const holiday = await tx.holiday.create({
          data: {
            ...data,
            branchId,
            effectiveStartDate: new Date(),
            createdBy: userId,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.HOLIDAY,
          entityId: holiday.id,
          action: AuditAction.CREATE,
          performedBy: userId,
          afterSnapshot: holiday,
        });

        return holiday;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    id: UUID,
    data: UpdateHolidayDto,
    userId: UUID,
  ): Promise<Holiday> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.holiday.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Holiday not found');
        }

        // If used in payroll, create new version instead of updating
        if (existing.isUsedInPayroll) {
          // End current version
          await tx.holiday.update({
            where: { id },
            data: {
              effectiveEndDate: new Date(),
              isCurrentVersion: false,
            },
          });

          // Create new version
          const newVersion = await tx.holiday.create({
            data: {
              branchId: existing.branchId,
              name: data.name ?? existing.name,
              type: data.type ?? existing.type,
              startDate: data.startDate ?? existing.startDate,
              endDate: data.endDate ?? existing.endDate,
              isPaid: data.isPaid ?? existing.isPaid,
              notes: data.notes ?? existing.notes,
              version: existing.version + 1,
              previousVersionId: existing.id,
              effectiveStartDate: new Date(),
              isCurrentVersion: true,
              isUsedInPayroll: false,
              createdBy: existing.createdBy,
            },
          });

          await this.auditService.log(tx, {
            entityType: EntityType.HOLIDAY,
            entityId: newVersion.id,
            action: AuditAction.UPDATE,
            performedBy: userId,
            beforeSnapshot: existing,
            afterSnapshot: newVersion,
            reason: 'New version created - original used in payroll',
          });

          return newVersion;
        }

        // Direct update if not used in payroll
        const updated = await tx.holiday.update({
          where: { id },
          data,
        });

        await this.auditService.log(tx, {
          entityType: EntityType.HOLIDAY,
          entityId: id,
          action: AuditAction.UPDATE,
          performedBy: userId,
          beforeSnapshot: existing,
          afterSnapshot: updated,
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async delete(id: UUID, userId: UUID): Promise<Holiday> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.holiday.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Holiday not found');
        }

        if (existing.isUsedInPayroll) {
          throw new BadRequestException(
            'Cannot delete holiday that has been used in payroll processing',
          );
        }

        const deleted = await tx.holiday.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.HOLIDAY,
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

  async markAsUsedInPayroll(holidayIds: UUID[]): Promise<void> {
    try {
      await this.prisma.holiday.updateMany({
        where: { id: { in: holidayIds } },
        data: { isUsedInPayroll: true },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getVersionHistory(holidayId: UUID): Promise<Holiday[]> {
    try {
      const holiday = await this.prisma.holiday.findUnique({
        where: { id: holidayId },
      });

      if (!holiday) {
        return [];
      }

      // Find the root holiday (oldest version)
      let rootId = holiday.id;
      let current = holiday;

      while (current.previousVersionId) {
        const previous = await this.prisma.holiday.findUnique({
          where: { id: current.previousVersionId },
        });
        if (!previous) break;
        rootId = previous.id;
        current = previous;
      }

      // Get all versions from root
      const versions: Holiday[] = [];
      let nextVersion = await this.prisma.holiday.findUnique({
        where: { id: rootId },
      });

      while (nextVersion) {
        versions.push(nextVersion);
        const next = await this.prisma.holiday.findFirst({
          where: { previousVersionId: nextVersion.id },
        });
        nextVersion = next;
      }

      return versions;
    } catch (error) {
      handleError(error);
    }
  }
}
