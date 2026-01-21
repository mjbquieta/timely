import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import {
  CreateDepartmentDto,
  CreateDepartmentPartialDto,
} from './department.dto';
import { UUID } from 'crypto';
import { AttendeeService } from '../attendee/attendee.service';
import { handleError } from 'src/common/exceptions/filter.exception';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendeeService: AttendeeService,
  ) {}

  async create(branchId: UUID, data: CreateDepartmentDto) {
    try {
      const isNameExist = await this.isNameExist(data.name, branchId);

      if (isNameExist) {
        throw new BadRequestException('Department name already exists');
      }

      return this.prisma.department.create({
        data: {
          branchId,
          ...data,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async findByBranch(branchId: UUID) {
    try {
      return this.prisma.department.findMany({
        where: { branchId, deletedAt: null },
        include: {
          users: {
            where: { deletedAt: null },
            include: {
              profile: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          shift: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isExist(id: UUID) {
    try {
      const departmentExists = await this.prisma.department.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });

      return Boolean(departmentExists);
    } catch (error) {
      handleError(error);
    }
  }

  async isNameExist(name: string, branchId: UUID) {
    try {
      const departmentExists = await this.prisma.department.findFirst({
        where: { name, deletedAt: null, branchId },
        select: { name: true },
      });

      return Boolean(departmentExists);
    } catch (error) {
      handleError(error);
    }
  }

  async findById(id: UUID) {
    try {
      return this.prisma.department.findUnique({
        where: { id, deletedAt: null },
        include: {
          users: {
            where: { deletedAt: null },
            include: {
              profile: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          shift: true,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async update(id: UUID, data: CreateDepartmentPartialDto) {
    try {
      return this.prisma.department.update({
        where: { id },
        data,
        include: {
          users: {
            include: {
              profile: true,
            },
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

  async delete(id: UUID) {
    try {
      const users = await this.prisma.user.findMany({
        where: { departmentId: id },
      });

      if (users.length > 0) {
        throw new BadRequestException('Department has users');
      }

      return this.prisma.department.delete({ where: { id } });
    } catch (error) {
      handleError(error);
    }
  }

  async addUserToDepartment(departmentId: UUID, userId: UUID, branchId: UUID) {
    try {
      const isUserHasDepartment =
        await this.attendeeService.isUserHasDepartment(userId, branchId);

      if (!isUserHasDepartment) {
        throw new BadRequestException('User already has a department');
      }

      return this.prisma.department.update({
        where: { id: departmentId },
        data: { users: { connect: { id: userId } } },
        include: { users: true },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async removeUserFromDepartment(departmentId: UUID, userId: UUID) {
    try {
      return this.prisma.department.update({
        where: { id: departmentId },
        data: { users: { disconnect: { id: userId } } },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isDepartmentHasShift(departmentId: UUID, shiftId: UUID) {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId, deletedAt: null, shiftId },
        select: { shiftId: true },
      });

      return Boolean(department);
    } catch (error) {
      handleError(error);
    }
  }
}
