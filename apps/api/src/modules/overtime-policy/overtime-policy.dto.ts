import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateOvertimePolicyDto {
  @IsInt()
  @Min(0)
  @Max(720) // 12 hours max
  maxDailyOtMinutes: number;

  @IsInt()
  @Min(0)
  @Max(2880) // 48 hours max per week
  maxWeeklyOtMinutes: number;
}

export class UpdateOvertimePolicyDto {
  @IsInt()
  @Min(0)
  @Max(720)
  @IsOptional()
  maxDailyOtMinutes?: number;

  @IsInt()
  @Min(0)
  @Max(2880)
  @IsOptional()
  maxWeeklyOtMinutes?: number;
}
