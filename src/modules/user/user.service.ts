import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Department,
  Shift,
  SignatureType,
  User,
  UserNonWorkingStatus,
  UserProfile,
  UserSignature,
  UserType,
} from '@prisma/client';
import { UUID } from 'crypto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { UpSertUserMessage } from '../websocket/device.interface';
import { BranchService } from '../branch/branch.service';
import { MakeUserAsDto, PartialUserDto } from './user.dto';
import { handleError } from 'src/common/exceptions/filter.exception';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchService: BranchService,
  ) {}

  async findOneByUserTypes(
    id: UUID,
    userType: UserType[],
  ): Promise<User & { profile: UserProfile }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, deletedAt: null, type: { hasSome: userType } },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async findAllByUserTypes(
    branchId: UUID,
    userType: UserType[],
  ): Promise<
    (User & {
      profile: UserProfile;
      department: Department & { shift: Shift };
    })[]
  > {
    try {
      const users = await this.prisma.user.findMany({
        where: { branchId, deletedAt: null, type: { hasSome: userType } },
        include: {
          profile: true,
          department: {
            include: {
              shift: true,
            },
          },
        },
        orderBy: {
          deviceEnrollId: 'asc',
        },
      });

      if (!users) {
        throw new NotFoundException('Users not found');
      }

      return users;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async findByEnrollId(
    enrollId: number,
    branchId: UUID,
  ): Promise<
    User & {
      profile: UserProfile;
      department: Department & { shift: Shift };
      userNonWorkingStatus: UserNonWorkingStatus[];
    }
  > {
    try {
      return this.prisma.user.findUnique({
        where: { deviceEnrollId: enrollId, branchId },
        include: {
          profile: true,
          department: {
            include: {
              shift: true,
            },
          },
          userNonWorkingStatus: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(userId: UUID): Promise<User & { profile: UserProfile }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
          type: { hasSome: [UserType.COMPANY_OWNER] },
        },
        include: {
          profile: true,
        },
      });

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async isUsernameExist(username: string): Promise<boolean> {
    const user = await this.prisma.userProfile.findUnique({
      where: { username },
    });

    return !!user;
  }

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.prisma.userProfile.findUnique({
      where: { email },
    });
    return !!user;
  }

  async isExist(id: UUID): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, deletedAt: null },
      });
      return !!user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async isCompanyOwnerExist(userId: UUID): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
          deletedAt: null,
          type: { hasSome: [UserType.COMPANY_OWNER] },
        },
      });
      return !!user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createUserFromDevice(data: UpSertUserMessage): Promise<
    User & {
      profile: UserProfile;
      signatures: UserSignature[];
      timezone: string;
    }
  > {
    try {
      let upSert = {} as User;

      const branch = await this.branchService.getBranchByDeviceSerialNumber(
        data.sn,
      );

      const existingUser = await this.prisma.user.findUnique({
        where: {
          deviceEnrollId: data.enrollid,
        },
      });

      if (existingUser) {
        upSert = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            type: [UserType.ATTENDEE],
            branchId: branch.id,
            deviceEnrollId: data.enrollid,
            deviceIsAdmin: data.admin === 1,
            deviceFpfFlag: data.fpflag === 1,
            deviceIsEnabled: data.enable === 1,
            deviceShiftId: data.shiftid,
            profile: {
              update: {
                name: data.name,
              },
            },
          },
        });
      } else {
        upSert = await this.prisma.user.create({
          data: {
            type: [UserType.ATTENDEE],
            branchId: branch.id,
            deviceEnrollId: data.enrollid,
            deviceIsAdmin: data.admin === 1,
            deviceFpfFlag: data.fpflag === 1,
            deviceIsEnabled: data.enable === 1,
            deviceShiftId: data.shiftid,
            profile: {
              create: {
                name: data.name,
              },
            },
          },
        });
      }

      if (data.backupnum >= 0) {
        const existingSignature = await this.prisma.userSignature.findFirst({
          where: {
            userId: upSert.id,
            deviceBackupNum: data.backupnum,
            deviceEnrollId: data.enrollid,
          },
        });

        if (existingSignature) {
          await this.prisma.userSignature.update({
            where: { id: existingSignature.id },
            data: {
              deviceSignature: data.record.toString(),
              type: this.mapSignatureType(data.backupnum),
              deviceEnrollId: data.enrollid,
            },
          });
        } else {
          await this.prisma.userSignature.create({
            data: {
              userId: upSert.id,
              deviceSignature: data.record.toString(),
              type: this.mapSignatureType(data.backupnum),
              deviceBackupNum: data.backupnum,
              deviceEnrollId: data.enrollid,
            },
          });
        }
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: upSert.id,
        },
        include: {
          profile: true,
          signatures: true,
        },
      });

      return {
        ...user,
        timezone: branch.timezone || 'Asia/Manila',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async makeUserAs(params: MakeUserAsDto, isRevoke: boolean = false) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: params.userId },
      });

      if (user.type.includes(params.userType) && !isRevoke) {
        throw new BadRequestException('User already has this type');
      }

      const type = isRevoke
        ? { set: user.type.filter((type) => type !== params.userType) }
        : { push: params.userType };

      const updatedUser = await this.prisma.user.update({
        where: { id: params.userId },
        data: {
          type,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async update(userId: UUID, data: PartialUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          profile: {
            update: data,
          },
        },
        include: {
          profile: true,
        },
      });
      return user;
    } catch (error) {
      handleError(error);
    }
  }

  private mapSignatureType(deviceBackupNum: number): SignatureType {
    switch (deviceBackupNum) {
      case 0:
        return SignatureType.FINGERPRINT;
      case 10:
        return SignatureType.PASSWORD;
      case 11:
        return SignatureType.RFID;
      case 50:
        return SignatureType.FACE_RECOGNITION;
      default:
        return SignatureType.FINGERPRINT;
    }
  }
}
