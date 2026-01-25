import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import { AuditAction, AuditLog, EntityType, Prisma } from '@prisma/client';

export interface AuditLogData {
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  beforeSnapshot?: any;
  afterSnapshot?: any;
  reason?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    txOrPrisma: PrismaService | Prisma.TransactionClient,
    data: AuditLogData,
  ): Promise<AuditLog> {
    try {
      return txOrPrisma.auditLog.create({
        data: {
          entityType: data.entityType,
          entityId: data.entityId,
          action: data.action,
          performedBy: data.performedBy,
          beforeSnapshot: data.beforeSnapshot ?? Prisma.JsonNull,
          afterSnapshot: data.afterSnapshot ?? Prisma.JsonNull,
          reason: data.reason,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getEntityHistory(
    entityType: EntityType,
    entityId: string,
  ): Promise<AuditLog[]> {
    try {
      return this.prisma.auditLog.findMany({
        where: { entityType, entityId },
        orderBy: { performedAt: 'desc' },
        include: {
          performer: {
            include: {
              profile: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getAuditLogById(id: UUID): Promise<AuditLog | null> {
    try {
      return this.prisma.auditLog.findUnique({
        where: { id },
        include: {
          performer: {
            include: {
              profile: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getRecentAuditLogs(
    limit: number = 50,
    entityType?: EntityType,
  ): Promise<AuditLog[]> {
    try {
      return this.prisma.auditLog.findMany({
        where: entityType ? { entityType } : undefined,
        orderBy: { performedAt: 'desc' },
        take: limit,
        include: {
          performer: {
            include: {
              profile: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
