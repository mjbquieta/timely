import { IsEmail, IsNotEmpty, IsStrongPassword, IsUUID } from 'class-validator';
import { UUID } from 'crypto';
import { IsAttendeeIdExist } from './attendee-id.exist.validator';

class AttendeeIdDto {
  @IsUUID(4)
  @IsAttendeeIdExist()
  attendeeId: UUID;
}

class AllowConsoleAccessDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  password: string;
}

export { AttendeeIdDto, AllowConsoleAccessDto };
