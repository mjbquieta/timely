import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import {
  CompanyPartialDto,
  CreateCompanyDto,
  CreateCompanyWithExistingOwnerDto,
} from './company.dto';
import { handleError } from 'src/common/exceptions/filter.exception';
import { HasConsole, UserType } from '@prisma/client';
import { UUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { isEmpty, omit } from 'lodash';

@Injectable()
export class CompanyService {
  private saltRounds: number;
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = Number(this.configService.get('SALT_ROUNDS'));
  }

  async find(companyId: UUID) {
    try {
      return await this.prisma.company.findFirst({
        where: { id: companyId },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async create(payload: CreateCompanyDto) {
    try {
      const hashedPassword = await bcrypt.hash(
        payload.owner.password,
        this.saltRounds,
      );
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            type: [UserType.COMPANY_OWNER],
            hasConsole: HasConsole.ALLOWED,
            profile: {
              create: {
                ...payload.owner,
                password: hashedPassword,
              },
            },
          },
          include: {
            profile: true,
          },
        });

        const company = await tx.company.create({
          data: {
            ...payload.company,
            ownerId: user.id,
          },
        });

        return {
          company,
          owner: {
            ...user,
            profile: omit(user.profile, ['user', 'password']),
          },
        };
      });
    } catch (error) {
      handleError(error);
    }
  }

  async createWithExistingOwner(payload: CreateCompanyWithExistingOwnerDto) {
    try {
      return await this.prisma.company.create({
        data: {
          name: payload.company.name,
          address1: payload.company.address1,
          address2: payload.company.address2,
          city: payload.company.city,
          state: payload.company.state,
          zip: payload.company.zip,
          country: payload.company.country,
          phone: payload.company.phone,
          ownerId: payload.ownerId,
        },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async isNameExist(name: string): Promise<boolean> {
    try {
      const companyExists = await this.prisma.company.findFirst({
        where: { name: { equals: name, mode: 'insensitive' }, deletedAt: null },
        select: { name: true },
      });

      if (isEmpty(companyExists)) {
        return false;
      }

      return Boolean(companyExists);
    } catch (error) {
      handleError(error);
    }
  }

  async isCompanyIdExist(companyId: UUID): Promise<boolean> {
    try {
      const companyExists = await this.prisma.company.findUnique({
        where: { id: companyId },
      });
      return Boolean(companyExists);
    } catch (error) {
      handleError(error);
    }
  }

  async update(companyId: UUID, payload: CompanyPartialDto) {
    try {
      return await this.prisma.company.update({
        where: { id: companyId },
        data: payload,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async delete(companyId: UUID) {
    try {
      return await this.prisma.company.update({
        where: { id: companyId },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
