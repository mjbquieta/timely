import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import {
  CreateAsBranchUserDto,
  LoginAsCompanyWithCompanyNameDto,
  LoginDto,
} from './auth.dto';
import {
  Branch,
  HasConsole,
  PortalType,
  User,
  UserProfile,
  UserType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { AccessTokenService } from '../access-token/access-token.service';
import { UUID } from 'crypto';
import { getExpirationDate } from 'src/common/utils/date.util';
import * as crypto from 'crypto';

@Injectable()
export class AuthService implements OnModuleInit {
  private saltRounds: number;
  private accessTokenDuration: string;
  private refreshTokenDuration: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  async onModuleInit() {
    this.saltRounds = Number(this.configService.get('SALT_ROUNDS'));
    this.accessTokenDuration = this.configService.get('ACCESS_TOKEN_DURATION');
    this.refreshTokenDuration = this.configService.get(
      'REFRESH_TOKEN_DURATION',
    );
  }

  async createAsBranchUser(
    data: CreateAsBranchUserDto,
  ): Promise<Branch & { users: (User & { profile: UserProfile })[] }> {
    try {
      const { branch, user, password } = data;

      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      if (!branch.name) {
        throw new Error('Branch name is required');
      }

      const branchUser = await this.prisma.branch.create({
        data: {
          ...branch,
          shifts: {
            create: {
              name: 'Branch Default Shift',
              isDefault: true,
              startTime: '09:30:00',
              endTime: '17:30:00',
            },
          },
          users: {
            create: {
              type: [UserType.BRANCH_OWNER],
              hasConsole: HasConsole.ALLOWED,
              profile: {
                create: {
                  username: user.username,
                  email: user.email,
                  address1: user.address1,
                  address2: user.address2,
                  city: user.city,
                  state: user.state,
                  zip: user.zip,
                  country: user.country,
                  phone: user.phone,
                  password: hashedPassword,
                },
              },
            },
          },
        },
        include: {
          users: {
            include: {
              branch: false,
              profile: true,
            },
          },
        },
      });

      return branchUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async loginAsBranchUser(data: LoginDto) {
    try {
      const { username, email, password } = data;

      const userTypes = this.findUserType(PortalType.BRANCH_PORTAL);

      const userProfile = await this.prisma.userProfile.findFirst({
        where: {
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
          ],
          user: {
            type: {
              hasSome: userTypes,
            },
            deletedAt: null,
          },
        },
        include: {
          user: {
            include: {
              branch: true,
            },
          },
        },
      });

      if (!userProfile) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        userProfile.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(
        userProfile.user.id as UUID,
        userProfile.email,
        userProfile.username,
        userProfile.user.type,
        PortalType.BRANCH_PORTAL,
      );

      return {
        user: omit(userProfile.user, ['branch']),
        branch: userProfile.user.branch,
        profile: omit(userProfile, ['user', 'password', 'userId']),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async loginAsAttendeeUser(data: LoginDto) {
    try {
      const { username, email, password } = data;

      const userTypes = this.findUserType(PortalType.ATTENDEE_PORTAL);

      const userProfile = await this.prisma.userProfile.findFirst({
        where: {
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
          ],
          user: {
            type: {
              hasSome: userTypes,
            },
            hasConsole: HasConsole.ALLOWED,
            deletedAt: null,
          },
        },
        include: {
          user: true,
        },
      });

      if (!userProfile) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (userProfile.user.hasConsole === HasConsole.DENIED) {
        throw new UnauthorizedException('User does not have console access');
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        userProfile.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(
        userProfile.user.id as UUID,
        userProfile.email,
        userProfile.username,
        userProfile.user.type,
        PortalType.ATTENDEE_PORTAL,
      );

      return {
        user: userProfile.user,
        profile: omit(userProfile, ['user', 'password', 'userId']),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async loginAsCompanyUser(data: LoginAsCompanyWithCompanyNameDto) {
    try {
      const { username, email, password, companyName } = data;

      const company = await this.prisma.company.findFirst({
        where: {
          name: {
            equals: companyName,
            mode: 'insensitive',
          },
        },
      });

      if (!company) {
        throw new UnauthorizedException('Company name not found');
      }

      const userTypes = this.findUserType(PortalType.COMPANY_PORTAL);
      const userProfile = await this.prisma.userProfile.findFirst({
        where: {
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
          ],
          user: {
            type: {
              hasSome: userTypes,
            },
            deletedAt: null,
          },
        },
        include: {
          user: {
            include: {
              companies: {
                where: {
                  deletedAt: null,
                  name: companyName,
                },
              },
            },
          },
        },
      });

      if (!userProfile) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        userProfile.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(
        userProfile.user.id as UUID,
        userProfile.email,
        userProfile.username,
        userProfile.user.type,
        PortalType.COMPANY_PORTAL,
      );

      const c = userProfile.user.companies.find((r) => r.id === company.id);

      return {
        user: omit(userProfile.user, ['companies']),
        company,
        profile: omit(userProfile, ['user', 'password', 'userId']),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  private async generateTokens(
    userId: UUID,
    email: string,
    username: string,
    userType: UserType[],
    portalType: PortalType,
    retryCount: number = 0,
  ) {
    if (retryCount > 5) {
      throw new BadRequestException(
        'Unable to generate unique tokens. Please try again.',
      );
    }

    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const payload = {
      sub: userId,
      email,
      username,
      userType,
      portalType,
      iat: timestamp,
      jti: randomBytes,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.accessTokenDuration,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.refreshTokenDuration,
      }),
    ]);

    try {
      await this.accessTokenService.create(userId, {
        accessToken,
        refreshToken,
        portalType,
        expiresAt: getExpirationDate(this.accessTokenDuration),
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error.message.includes('Token collision detected')) {
        return this.generateTokens(
          userId,
          email,
          username,
          userType,
          portalType,
          retryCount + 1,
        );
      }
      throw error;
    }
  }

  private findUserType(portalType: PortalType): UserType[] {
    switch (portalType) {
      case PortalType.BRANCH_PORTAL:
        return [UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN];
      case PortalType.ADMIN_PORTAL:
        return [UserType.ADMIN];
      case PortalType.ATTENDEE_PORTAL:
        return [UserType.ATTENDEE];
      case PortalType.COMPANY_PORTAL:
        return [UserType.COMPANY_OWNER];
      default:
        throw new BadRequestException('Invalid portal type');
    }
  }
}
