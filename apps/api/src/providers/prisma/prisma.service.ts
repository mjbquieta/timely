import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Branch, PrismaClient, User, UserProfile } from '@prisma/client';
import { UUID } from 'crypto';
import { omit } from 'lodash';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // log: ['query', 'info', 'warn', 'error'], // Enable logging of queries
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async getUserProfile(
    id: UUID,
  ): Promise<[User, Omit<UserProfile, 'password'>, Branch]> {
    try {
      const user = await this.user.findUnique({
        where: { id, deletedAt: null },
        include: {
          profile: true,
          branch: {
            include: {
              shifts: true,
              departments: true,
            },
          },
        },
      });

      if (!user || !user.profile) {
        throw new NotFoundException('User or profile not found');
      }

      const defaultShift =
        user.branch.shifts.find((shift) => shift.isDefault) || null;

      const branch = { ...user.branch, defaultShift };

      return [user, omit(user.profile, ['password']), branch];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  // private omitPasswordFields(data: any): any {
  //   if (!data) {
  //     return data;
  //   }

  //   // Handle arrays
  //   if (Array.isArray(data)) {
  //     return data.map((item) => this.omitPasswordFields(item));
  //   }

  //   // Handle objects
  //   if (typeof data === 'object') {
  //     const result: any = {};

  //     for (const [key, value] of Object.entries(data)) {
  //       // Skip password fields
  //       if (key.toLowerCase().includes('password')) {
  //         continue;
  //       }

  //       // Recursively process nested objects and arrays
  //       if (typeof value === 'object' && value !== null) {
  //         result[key] = this.omitPasswordFields(value);
  //       } else {
  //         result[key] = value;
  //       }
  //     }

  //     return result;
  //   }

  //   return data;
  // }
}
