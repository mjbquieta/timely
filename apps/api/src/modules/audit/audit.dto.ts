import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EntityType } from '@prisma/client';
import { UUID } from 'crypto';

export class AuditEntityQueryDto {
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsUUID(4)
  entityId: UUID;
}

export class AuditLogIdDto {
  @IsUUID(4)
  auditLogId: UUID;
}

export class AuditQueryDto {
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;
}
