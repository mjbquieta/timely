import { PortalType } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

class AccessTokenDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsEnum(PortalType)
  portalType: PortalType;

  @IsDate()
  @IsOptional()
  expiresAt: Date;
}

export { AccessTokenDto };
