import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import {
  AuditAction,
  EntityType,
  PayrollCutoff,
  PayrollCutoffStatus,
} from '@prisma/client';
import {
  CreatePayrollCutoffDto,
  UpdatePayrollCutoffDto,
} from './payroll-cutoff.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PayrollCutoffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getPayrollCutoffs(branchId: UUID): Promise<PayrollCutoff[]> {
    try {
      return this.prisma.payrollCutoff.findMany({
        where: {
          branchId,
          deletedAt: null,
        },
        orderBy: {
          periodStartDate: 'desc',
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getPayrollCutoffById(id: UUID): Promise<PayrollCutoff | null> {
    try {
      return this.prisma.payrollCutoff.findUnique({
        where: { id, deletedAt: null },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isExist(id: UUID): Promise<boolean> {
    try {
      const cutoff = await this.prisma.payrollCutoff.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });
      return Boolean(cutoff);
    } catch (error) {
      handleError(error);
    }
  }

  async getCurrentCutoff(branchId: UUID): Promise<PayrollCutoff | null> {
    try {
      const now = new Date();

      return this.prisma.payrollCutoff.findFirst({
        where: {
          branchId,
          status: PayrollCutoffStatus.ACTIVE,
          periodStartDate: { lte: now },
          periodEndDate: { gte: now },
          deletedAt: null,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isWithinValidCutoff(
    attendanceTime: Date,
    branchId: UUID,
  ): Promise<{ isValid: boolean; cutoff: PayrollCutoff | null }> {
    try {
      const cutoff = await this.prisma.payrollCutoff.findFirst({
        where: {
          branchId,
          status: {
            in: [PayrollCutoffStatus.ACTIVE, PayrollCutoffStatus.DRAFT],
          },
          periodStartDate: { lte: attendanceTime },
          periodEndDate: { gte: attendanceTime },
          deletedAt: null,
        },
      });

      return { isValid: !!cutoff, cutoff };
    } catch (error) {
      handleError(error);
    }
  }

  async create(
    branchId: UUID,
    data: CreatePayrollCutoffDto,
    userId: UUID,
  ): Promise<PayrollCutoff> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const cutoff = await tx.payrollCutoff.create({
          data: {
            branchId,
            name: data.name,
            periodStartDate: new Date(data.periodStartDate),
            periodStartTime: data.periodStartTime,
            periodEndDate: new Date(data.periodEndDate),
            periodEndTime: data.periodEndTime,
            releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
            createdBy: userId,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.PAYROLL_CUTOFF,
          entityId: cutoff.id,
          action: AuditAction.CREATE,
          performedBy: userId,
          afterSnapshot: cutoff,
        });

        return cutoff;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    id: UUID,
    data: UpdatePayrollCutoffDto,
    userId: UUID,
  ): Promise<PayrollCutoff> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.payrollCutoff.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Payroll cutoff not found');
        }

        if (
          existing.status === PayrollCutoffStatus.LOCKED ||
          existing.status === PayrollCutoffStatus.RELEASED
        ) {
          throw new BadRequestException(
            'Cannot update locked or released payroll cutoff',
          );
        }

        const updated = await tx.payrollCutoff.update({
          where: { id },
          data: {
            name: data.name,
            periodStartDate: data.periodStartDate
              ? new Date(data.periodStartDate)
              : undefined,
            periodStartTime: data.periodStartTime,
            periodEndDate: data.periodEndDate
              ? new Date(data.periodEndDate)
              : undefined,
            periodEndTime: data.periodEndTime,
            releaseDate: data.releaseDate
              ? new Date(data.releaseDate)
              : undefined,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.PAYROLL_CUTOFF,
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

  async activate(id: UUID, userId: UUID): Promise<PayrollCutoff> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.payrollCutoff.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Payroll cutoff not found');
        }

        if (existing.status !== PayrollCutoffStatus.DRAFT) {
          throw new BadRequestException('Only draft cutoffs can be activated');
        }

        const updated = await tx.payrollCutoff.update({
          where: { id },
          data: { status: PayrollCutoffStatus.ACTIVE },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.PAYROLL_CUTOFF,
          entityId: id,
          action: AuditAction.UPDATE,
          performedBy: userId,
          beforeSnapshot: existing,
          afterSnapshot: updated,
          reason: 'Cutoff activated',
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async lock(id: UUID, userId: UUID): Promise<PayrollCutoff> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.payrollCutoff.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Payroll cutoff not found');
        }

        if (existing.status === PayrollCutoffStatus.LOCKED) {
          throw new BadRequestException('Cutoff is already locked');
        }

        if (existing.status === PayrollCutoffStatus.RELEASED) {
          throw new BadRequestException('Cannot lock a released cutoff');
        }

        const updated = await tx.payrollCutoff.update({
          where: { id },
          data: {
            status: PayrollCutoffStatus.LOCKED,
            lockedAt: new Date(),
            lockedBy: userId,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.PAYROLL_CUTOFF,
          entityId: id,
          action: AuditAction.LOCK,
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

  async hrOverride(
    id: UUID,
    userId: UUID,
    reason: string,
  ): Promise<PayrollCutoff> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.payrollCutoff.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Payroll cutoff not found');
        }

        if (existing.status !== PayrollCutoffStatus.LOCKED) {
          throw new BadRequestException('Can only override locked cutoffs');
        }

        const updated = await tx.payrollCutoff.update({
          where: { id },
          data: {
            status: PayrollCutoffStatus.ACTIVE,
            lastOverrideAt: new Date(),
            lastOverrideBy: userId,
            lastOverrideReason: reason,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.PAYROLL_CUTOFF,
          entityId: id,
          action: AuditAction.OVERRIDE,
          performedBy: userId,
          beforeSnapshot: existing,
          afterSnapshot: updated,
          reason,
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async release(id: UUID, userId: UUID): Promise<PayrollCutoff> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.payrollCutoff.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Payroll cutoff not found');
        }

        if (existing.status !== PayrollCutoffStatus.LOCKED) {
          throw new BadRequestException('Cutoff must be locked before release');
        }

        const updated = await tx.payrollCutoff.update({
          where: { id },
          data: {
            status: PayrollCutoffStatus.RELEASED,
            releaseDate: new Date(),
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.PAYROLL_CUTOFF,
          entityId: id,
          action: AuditAction.UPDATE,
          performedBy: userId,
          beforeSnapshot: existing,
          afterSnapshot: updated,
          reason: 'Payroll released',
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async delete(id: UUID, userId: UUID): Promise<PayrollCutoff> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existing = await tx.payrollCutoff.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new BadRequestException('Payroll cutoff not found');
        }

        if (existing.status !== PayrollCutoffStatus.DRAFT) {
          throw new BadRequestException('Can only delete draft cutoffs');
        }

        const deleted = await tx.payrollCutoff.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.PAYROLL_CUTOFF,
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
