import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { IsDepartmentIdExist } from './department-id.exist.validator';
import { UUID } from 'crypto';
import { IsUserIdExist } from '../user/validators/user-id.exist.validator';

class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class DepartmentIdDto {
  @IsDepartmentIdExist()
  @IsUUID(4)
  departmentId: UUID;
}

class TagUserToDepartmentUserDto extends DepartmentIdDto {
  @IsUserIdExist()
  @IsUUID(4)
  userId: UUID;
}

class CreateDepartmentPartialDto extends PartialType(CreateDepartmentDto) {}

export {
  CreateDepartmentDto,
  CreateDepartmentPartialDto,
  DepartmentIdDto,
  TagUserToDepartmentUserDto,
};
