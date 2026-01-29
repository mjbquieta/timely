import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import {
  AuditAction,
  EntityType,
  TimeRequest,
  TimeRequestType,
  TimeRequestStatus,
  AttendanceStatus,
  HalfDayType,
} from '@prisma/client';
import {
  CreateLeaveRequestDto,
  CreateOvertimeRequestDto,
  CreateUndertimeRequestDto,
  ReviewTimeRequestDto,
  TimeRequestQueryDto,
  PendingRequestsQueryDto,
} from './time-request.dto';
import { AuditService } from '../audit/audit.service';

const PAST_DATE_LIMIT_DAYS = 7;

@Injectable()
export class TimeRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getMyRequests(
    userId: UUID,
    query: TimeRequestQueryDto,
  ): Promise<TimeRequest[]> {
    try {
      const where: any = {
        userId,
        deletedAt: null,
      };

      if (query.type) {
        where.type = query.type;
      }

      if (query.status) {
        where.status = query.status;
      }

      return this.prisma.timeRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            include: { profile: true },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getPendingRequests(
    branchId: UUID,
    query: PendingRequestsQueryDto,
  ): Promise<TimeRequest[]> {
    try {
      const where: any = {
        branchId,
        status: TimeRequestStatus.PENDING,
        deletedAt: null,
      };

      if (query.userId) {
        where.userId = query.userId;
      }

      if (query.type) {
        where.type = query.type;
      }

      return this.prisma.timeRequest.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getApprovedRequests(
    branchId: UUID,
    query: PendingRequestsQueryDto,
  ): Promise<TimeRequest[]> {
    try {
      const where: any = {
        branchId,
        status: TimeRequestStatus.APPROVED,
        deletedAt: null,
      };

      if (query.userId) {
        where.userId = query.userId;
      }

      if (query.type) {
        where.type = query.type;
      }

      return this.prisma.timeRequest.findMany({
        where,
        orderBy: { reviewedAt: 'desc' },
        include: {
          user: {
            include: { profile: true },
          },
          reviewer: {
            include: { profile: true },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getById(id: UUID): Promise<TimeRequest | null> {
    try {
      return this.prisma.timeRequest.findUnique({
        where: { id, deletedAt: null },
        include: {
          user: { include: { profile: true } },
          reviewer: { include: { profile: true } },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isExist(id: UUID): Promise<boolean> {
    try {
      const request = await this.prisma.timeRequest.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });
      return Boolean(request);
    } catch (error) {
      handleError(error);
    }
  }

  // Calculate working days between two dates (excluding weekends for simplicity)
  private calculateLeaveDays(
    startDate: string,
    endDate: string,
    halfDayType?: HalfDayType,
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Adjust for half day
    if (halfDayType && halfDayType !== HalfDayType.NONE && days > 0) {
      days -= 0.5;
    }

    return days;
  }

  // Calculate minutes between two times
  private calculateMinutes(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  }

  // Validate date is not too far in the past
  private validatePastDate(date: string): void {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays > PAST_DATE_LIMIT_DAYS) {
      throw new BadRequestException(
        `Cannot file requests for dates more than ${PAST_DATE_LIMIT_DAYS} days in the past`,
      );
    }
  }

  async createLeaveRequest(
    branchId: UUID,
    userId: UUID,
    data: CreateLeaveRequestDto,
  ): Promise<TimeRequest> {
    try {
      // Validate dates - skip past date restriction for Emergency Leave (EL) and Sick Leave (SL)
      if (data.leaveType !== 'EL' && data.leaveType !== 'SL') {
        this.validatePastDate(data.startDate);
      }

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      const leaveDays = this.calculateLeaveDays(
        data.startDate,
        data.endDate,
        data.halfDayType,
      );

      // Check for overlapping leave requests
      const overlapping = await this.prisma.timeRequest.findFirst({
        where: {
          userId,
          type: TimeRequestType.LEAVE,
          status: { in: [TimeRequestStatus.PENDING, TimeRequestStatus.APPROVED] },
          deletedAt: null,
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          'You already have a leave request overlapping with these dates',
        );
      }

      // Check leave balance (skip for LWOP)
      if (data.leaveType !== 'LWOP') {
        const year = startDate.getFullYear();
        const balance = await this.prisma.leaveBalance.findUnique({
          where: {
            userId_leaveType_year: {
              userId,
              leaveType: data.leaveType,
              year,
            },
          },
        });

        if (!balance) {
          throw new BadRequestException(
            `No leave balance found for ${data.leaveType} in ${year}`,
          );
        }

        const availableDays =
          balance.totalAllowance - balance.usedDays - balance.pendingDays;

        if (leaveDays > availableDays) {
          throw new BadRequestException(
            `Insufficient leave balance. Available: ${availableDays} days, Requested: ${leaveDays} days`,
          );
        }
      }

      return this.prisma.$transaction(async (tx) => {
        const request = await tx.timeRequest.create({
          data: {
            branchId,
            userId,
            type: TimeRequestType.LEAVE,
            leaveType: data.leaveType,
            startDate,
            endDate,
            halfDayType: data.halfDayType || HalfDayType.NONE,
            reason: data.reason,
            attachmentUrl: data.attachmentUrl,
          },
        });

        // Update pending days in leave balance (skip for LWOP)
        if (data.leaveType !== 'LWOP') {
          await tx.leaveBalance.update({
            where: {
              userId_leaveType_year: {
                userId,
                leaveType: data.leaveType,
                year: startDate.getFullYear(),
              },
            },
            data: {
              pendingDays: { increment: leaveDays },
            },
          });
        }

        await this.auditService.log(tx, {
          entityType: EntityType.TIME_REQUEST,
          entityId: request.id,
          action: AuditAction.CREATE,
          performedBy: userId,
          afterSnapshot: request,
        });

        return request;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async createOvertimeRequest(
    branchId: UUID,
    userId: UUID,
    data: CreateOvertimeRequestDto,
  ): Promise<TimeRequest> {
    try {
      this.validatePastDate(data.otDate);

      const otMinutes = this.calculateMinutes(data.otStartTime, data.otEndTime);

      if (otMinutes <= 0) {
        throw new BadRequestException('End time must be after start time');
      }

      // Check overtime policy limits
      const policy = await this.prisma.overtimePolicy.findUnique({
        where: { branchId },
      });

      if (policy && otMinutes > policy.maxDailyOtMinutes) {
        throw new BadRequestException(
          `Overtime exceeds daily limit of ${policy.maxDailyOtMinutes} minutes`,
        );
      }

      // Check for overlapping OT requests on same day
      const otDate = new Date(data.otDate);
      const overlapping = await this.prisma.timeRequest.findFirst({
        where: {
          userId,
          type: TimeRequestType.OVERTIME,
          otDate,
          status: { in: [TimeRequestStatus.PENDING, TimeRequestStatus.APPROVED] },
          deletedAt: null,
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          'You already have an overtime request for this date',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        const request = await tx.timeRequest.create({
          data: {
            branchId,
            userId,
            type: TimeRequestType.OVERTIME,
            otDate,
            otStartTime: data.otStartTime,
            otEndTime: data.otEndTime,
            otTotalMinutes: otMinutes,
            reason: data.reason,
            attachmentUrl: data.attachmentUrl,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.TIME_REQUEST,
          entityId: request.id,
          action: AuditAction.CREATE,
          performedBy: userId,
          afterSnapshot: request,
        });

        return request;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async createUndertimeRequest(
    branchId: UUID,
    userId: UUID,
    data: CreateUndertimeRequestDto,
  ): Promise<TimeRequest> {
    try {
      this.validatePastDate(data.utDate);

      const utMinutes = this.calculateMinutes(data.utStartTime, data.utEndTime);

      if (utMinutes <= 0) {
        throw new BadRequestException('End time must be after start time');
      }

      // Check for overlapping UT requests on same day
      const utDate = new Date(data.utDate);
      const overlapping = await this.prisma.timeRequest.findFirst({
        where: {
          userId,
          type: TimeRequestType.UNDERTIME,
          utDate,
          status: { in: [TimeRequestStatus.PENDING, TimeRequestStatus.APPROVED] },
          deletedAt: null,
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          'You already have an undertime request for this date',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        const request = await tx.timeRequest.create({
          data: {
            branchId,
            userId,
            type: TimeRequestType.UNDERTIME,
            utDate,
            utStartTime: data.utStartTime,
            utEndTime: data.utEndTime,
            utTotalMinutes: utMinutes,
            reason: data.reason,
            attachmentUrl: data.attachmentUrl,
          },
        });

        await this.auditService.log(tx, {
          entityType: EntityType.TIME_REQUEST,
          entityId: request.id,
          action: AuditAction.CREATE,
          performedBy: userId,
          afterSnapshot: request,
        });

        return request;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async cancelRequest(id: UUID, userId: UUID): Promise<TimeRequest> {
    try {
      const request = await this.prisma.timeRequest.findUnique({
        where: { id },
      });

      if (!request) {
        throw new BadRequestException('Time request not found');
      }

      if (request.userId !== userId) {
        throw new BadRequestException('You can only cancel your own requests');
      }

      if (request.status !== TimeRequestStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be cancelled');
      }

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.timeRequest.update({
          where: { id },
          data: { status: TimeRequestStatus.CANCELLED },
        });

        // Restore pending days if it was a leave request (skip LWOP)
        if (
          request.type === TimeRequestType.LEAVE &&
          request.leaveType &&
          request.leaveType !== 'LWOP' &&
          request.startDate &&
          request.endDate
        ) {
          const leaveDays = this.calculateLeaveDays(
            request.startDate.toISOString().split('T')[0],
            request.endDate.toISOString().split('T')[0],
            request.halfDayType || undefined,
          );

          await tx.leaveBalance.update({
            where: {
              userId_leaveType_year: {
                userId: request.userId,
                leaveType: request.leaveType,
                year: request.startDate.getFullYear(),
              },
            },
            data: {
              pendingDays: { decrement: leaveDays },
            },
          });
        }

        await this.auditService.log(tx, {
          entityType: EntityType.TIME_REQUEST,
          entityId: id,
          action: AuditAction.UPDATE,
          performedBy: userId,
          beforeSnapshot: request,
          afterSnapshot: updated,
          reason: 'Request cancelled by user',
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async approveRequest(
    id: UUID,
    reviewerId: UUID,
    data: ReviewTimeRequestDto,
  ): Promise<TimeRequest> {
    try {
      const request = await this.prisma.timeRequest.findUnique({
        where: { id },
      });

      if (!request) {
        throw new BadRequestException('Time request not found');
      }

      if (request.status !== TimeRequestStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be approved');
      }

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.timeRequest.update({
          where: { id },
          data: {
            status: TimeRequestStatus.APPROVED,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            reviewerRemarks: data.remarks,
          },
        });

        // Process leave request: update balance and attendance
        if (
          request.type === TimeRequestType.LEAVE &&
          request.startDate &&
          request.endDate
        ) {
          const leaveDays = this.calculateLeaveDays(
            request.startDate.toISOString().split('T')[0],
            request.endDate.toISOString().split('T')[0],
            request.halfDayType || undefined,
          );

          // Update leave balance (skip LWOP)
          if (request.leaveType && request.leaveType !== 'LWOP') {
            await tx.leaveBalance.update({
              where: {
                userId_leaveType_year: {
                  userId: request.userId,
                  leaveType: request.leaveType,
                  year: request.startDate.getFullYear(),
                },
              },
              data: {
                usedDays: { increment: leaveDays },
                pendingDays: { decrement: leaveDays },
              },
            });
          }

          // Update attendance status for leave dates
          const attendanceStatus =
            request.leaveType === 'SL'
              ? AttendanceStatus.SICK
              : AttendanceStatus.VACATION;

          // Update existing attendance records for the leave period
          const current = new Date(request.startDate);
          const endDate = new Date(request.endDate);

          while (current <= endDate) {
            const startOfDay = new Date(current);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(current);
            endOfDay.setHours(23, 59, 59, 999);

            await tx.attendance.updateMany({
              where: {
                userId: request.userId,
                time: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              data: {
                status: attendanceStatus,
              },
            });

            current.setDate(current.getDate() + 1);
          }
        }

        await this.auditService.log(tx, {
          entityType: EntityType.TIME_REQUEST,
          entityId: id,
          action: AuditAction.UPDATE,
          performedBy: reviewerId,
          beforeSnapshot: request,
          afterSnapshot: updated,
          reason: 'Request approved',
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }

  async rejectRequest(
    id: UUID,
    reviewerId: UUID,
    data: ReviewTimeRequestDto,
  ): Promise<TimeRequest> {
    try {
      const request = await this.prisma.timeRequest.findUnique({
        where: { id },
      });

      if (!request) {
        throw new BadRequestException('Time request not found');
      }

      if (request.status !== TimeRequestStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be rejected');
      }

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.timeRequest.update({
          where: { id },
          data: {
            status: TimeRequestStatus.REJECTED,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            reviewerRemarks: data.remarks,
          },
        });

        // Restore pending days if it was a leave request (skip LWOP)
        if (
          request.type === TimeRequestType.LEAVE &&
          request.leaveType &&
          request.leaveType !== 'LWOP' &&
          request.startDate &&
          request.endDate
        ) {
          const leaveDays = this.calculateLeaveDays(
            request.startDate.toISOString().split('T')[0],
            request.endDate.toISOString().split('T')[0],
            request.halfDayType || undefined,
          );

          await tx.leaveBalance.update({
            where: {
              userId_leaveType_year: {
                userId: request.userId,
                leaveType: request.leaveType,
                year: request.startDate.getFullYear(),
              },
            },
            data: {
              pendingDays: { decrement: leaveDays },
            },
          });
        }

        await this.auditService.log(tx, {
          entityType: EntityType.TIME_REQUEST,
          entityId: id,
          action: AuditAction.UPDATE,
          performedBy: reviewerId,
          beforeSnapshot: request,
          afterSnapshot: updated,
          reason: data.remarks || 'Request rejected',
        });

        return updated;
      });
    } catch (error) {
      handleError(error);
    }
  }
}
