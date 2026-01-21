import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { CreateShiftDto, CreateShiftPartialDto } from './shift.dto';
import { handleError } from 'src/common/exceptions/filter.exception';
import { UUID } from 'crypto';
import { DepartmentService } from '../department/department.service';
import { Shift } from '@prisma/client';

@Injectable()
export class ShiftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departmentService: DepartmentService,
  ) {}

  async getShifts(branchId: UUID): Promise<Shift[]> {
    try {
      return this.prisma.shift.findMany({
        where: {
          branchId,
          deletedAt: null,
        },
        include: {
          departments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          isDefault: 'desc',
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getDefaultShift(branchId: UUID): Promise<Shift | null> {
    try {
      return this.prisma.shift.findFirst({
        where: { branchId, deletedAt: null, isDefault: true },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getShiftById(id: UUID): Promise<Shift | null> {
    try {
      return this.prisma.shift.findUnique({
        where: { id, deletedAt: null },
        include: {
          departments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async create(branchId: UUID, data: CreateShiftDto): Promise<Shift> {
    try {
      return this.prisma.shift.create({
        data: {
          ...data,
          branchId,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isExist(id: UUID): Promise<boolean> {
    try {
      const shift = await this.prisma.shift.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });

      return Boolean(shift);
    } catch (error) {
      handleError(error);
    }
  }

  async update(id: UUID, data: CreateShiftPartialDto): Promise<Shift> {
    if (!data.isDefault) {
      const shift = await this.getShiftById(id);

      if (shift.isDefault) {
        throw new BadRequestException(
          'Default shift cannot be updated to false',
        );
      }
    }

    try {
      return this.prisma.shift.update({
        where: { id },
        data,
        include: {
          departments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async delete(id: UUID): Promise<Shift> {
    try {
      const departments = await this.prisma.department.findMany({
        where: { shiftId: id },
      });

      const deparmentIds = departments.map((department) => department.id);

      if (deparmentIds.length > 0) {
        await this.prisma.department.updateMany({
          where: { id: { in: deparmentIds } },
          data: { shiftId: null },
        });
      }

      return this.prisma.shift.delete({ where: { id } });
    } catch (error) {
      handleError(error);
    }
  }

  async tagToDepartment(shiftId: UUID, departmentId: UUID): Promise<Shift> {
    try {
      const shift = await this.getShiftById(shiftId);

      if (shift.isDefault) {
        throw new BadRequestException(
          'Department cannot be tagged to default shift',
        );
      }

      const isDepartmentHasShift =
        await this.departmentService.isDepartmentHasShift(
          departmentId,
          shiftId,
        );

      if (isDepartmentHasShift) {
        throw new BadRequestException('Department has shift already');
      }

      return this.prisma.shift.update({
        where: { id: shiftId },
        data: { departments: { connect: { id: departmentId } } },
        include: {
          departments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async untagFromDepartment(shiftId: UUID, departmentId: UUID): Promise<Shift> {
    try {
      return this.prisma.shift.update({
        where: { id: shiftId },
        data: { departments: { disconnect: { id: departmentId } } },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
