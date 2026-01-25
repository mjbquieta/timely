import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Attendance,
  AttendanceStatus,
  DeviceMode,
  UserType,
} from '@prisma/client';
import { UUID } from 'crypto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { TimeSyncMessage } from '../websocket/device.interface';
import { BranchService } from '../branch/branch.service';
import { UserService } from '../user/user.service';
import { format, toZonedTime } from 'date-fns-tz';
import { format as formatDate } from 'date-fns';
import { QueryAttendanceDto } from '../branch/branch.dto';
import {
  createDateRangeFilter,
  getHumanReadableDuration,
  generateDateRangeArray,
} from '../../common/utils/date.util';
import { handleError } from 'src/common/exceptions/filter.exception';
import { omit } from 'lodash';
import { ShiftService } from '../shift/shift.service';
import { AttendanceStatusHelper } from './attendance-status.helper';

@Injectable()
export class ClockService {
  private readonly logger = new Logger(ClockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly branchService: BranchService,
    private readonly userService: UserService,
    private readonly shiftService: ShiftService,
    private readonly attendanceStatusHelper: AttendanceStatusHelper,
  ) {}

  async addRecord(data: TimeSyncMessage): Promise<Attendance[]> {
    try {
      const { cmd, sn, count, logindex, record: records } = data;

      const branch = await this.branchService.getBranchByDeviceSerialNumber(sn);

      const shift = await this.shiftService.getDefaultShift(branch.id as UUID);

      return Promise.all(
        records.map(async (record) => {
          let startTime = null;
          let endTime = null;
          let departmentName = null;
          const user = await this.userService.findByEnrollId(
            record.enrollid,
            branch.id as UUID,
          );

          if (!user) {
            this.logger.warn(`User not found: ${record.enrollid}`);
            throw new NotFoundException(`User not found: ${record.enrollid}`);
          }

          const localDate = toZonedTime(new Date(record.time), branch.timezone);
          const dateString = format(localDate, 'yyyy-MM-dd');

          // Check for user-specific non-working status (highest priority)
          const nonWorkingStatus = user.userNonWorkingStatus.find(
            (status) => status.date === dateString,
          );

          // Check for branch-level holidays and rest days
          const { isHoliday, isRestDay } =
            await this.attendanceStatusHelper.getStatusForDate(
              user.id as UUID,
              branch.id as UUID,
              dateString,
            );

          if (user.department?.shift) {
            departmentName = user.department.name;
            startTime = user.department.shift.startTime;
            endTime = user.department.shift.endTime;
          } else {
            departmentName = 'Branch Default Shift';
            startTime = shift.startTime;
            endTime = shift.endTime;
          }

          // Determine attendance status with priority:
          // 1. User-specific non-working status (highest)
          // 2. Branch holiday
          // 3. Rest day rule
          // 4. Default to PRESENT
          let attendanceStatus: AttendanceStatus = AttendanceStatus.PRESENT;
          if (nonWorkingStatus) {
            attendanceStatus = nonWorkingStatus.status;
          } else if (isHoliday) {
            attendanceStatus = AttendanceStatus.NO_WORK;
          } else if (isRestDay) {
            attendanceStatus = AttendanceStatus.NO_WORK;
          }

          return this.prisma.attendance.create({
            data: {
              userId: user.id,
              branchId: branch.id,
              status: attendanceStatus,
              time: new Date(record.time),
              deviceMode: this.mapDeviceMode(record.mode),
              createdAt: new Date(),
              timezone: branch.timezone,
              departmentName,
              startTime,
              endTime,
            },
          });
        }),
      );
    } catch (error) {
      handleError(error);
    }
  }

  async findAttendanceLogByBranch(branchId: UUID, query: QueryAttendanceDto) {
    try {
      const branch = await this.branchService.getBranchById(branchId);

      let dateFilter = {};
      if (query.startDate) {
        const dateRange = createDateRangeFilter(
          query.startDate,
          query.endDate,
          branch.timezone,
        );

        if (dateRange) {
          dateFilter = { time: dateRange };
        }
      }

      const attendances = await this.prisma.attendance.findMany({
        where: {
          branchId,
          deletedAt: null,
          status: AttendanceStatus.PRESENT,
          ...(query.attendeeId && { userId: query.attendeeId }),
          ...dateFilter,
        },
        include: {
          user: {
            include: {
              profile: true,
              department: {
                include: {
                  shift: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const attendancesWithManilaTime = attendances.map((attendance) => {
        return {
          ...omit(attendance, [
            'user.profile.password',
            'user.department.shift',
          ]),
          time: attendance.time.toISOString(),
        };
      });

      return attendancesWithManilaTime;
    } catch (error) {
      handleError(error);
    }
  }

  async findAttendanceUsersLogByBranch(
    branchId: UUID,
    query: QueryAttendanceDto,
  ) {
    try {
      const branch = await this.branchService.getBranchById(branchId);

      // Get all users for the branch
      const allUsers = await this.userService.findAllByUserTypes(branchId, [
        UserType.ATTENDEE,
      ]);

      let dateFilter = {};
      if (query.startDate) {
        const dateRangeFilter = createDateRangeFilter(
          query.startDate,
          query.endDate,
          branch.timezone,
        );

        if (dateRangeFilter) {
          dateFilter = { time: dateRangeFilter };
        }
      }

      // Get all attendances for the branch
      const attendances = await this.prisma.attendance.findMany({
        where: {
          branchId,
          deletedAt: null,
          status: AttendanceStatus.PRESENT,
          ...(query.attendeeId && { userId: query.attendeeId }),
          ...dateFilter,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          time: 'desc',
        },
      });

      // Group attendances by date first, then by user
      const dateAttendanceMap = new Map<string, Map<string, any[]>>();

      attendances.forEach((attendance) => {
        const date = format(
          // toZonedTime(attendance.time, branch.timezone),
          attendance.time,
          'yyyy-MM-dd',
          {
            timeZone: branch.timezone,
          },
        );
        const userId = attendance.userId;

        if (!dateAttendanceMap.has(date)) {
          dateAttendanceMap.set(date, new Map());
        }

        const dateUserMap = dateAttendanceMap.get(date);
        if (!dateUserMap.has(userId)) {
          dateUserMap.set(userId, []);
        }

        dateUserMap.get(userId).push(attendance);
      });

      // Generate complete date range
      let datesToProcess: string[] = [];

      if (query.startDate) {
        // Use provided date range
        datesToProcess = generateDateRangeArray(
          query.startDate,
          query.endDate,
          branch.timezone,
        );
      } else {
        // Generate complete range from min to max attendance dates
        const attendanceDates = Array.from(dateAttendanceMap.keys()).sort();
        if (attendanceDates.length > 0) {
          const minDate = attendanceDates[0];
          const maxDate = attendanceDates[attendanceDates.length - 1];
          datesToProcess = generateDateRangeArray(
            minDate,
            maxDate,
            branch.timezone,
          );
        }
      }

      // Process each date's attendance log
      const result = datesToProcess.map((date) => {
        const userMap = dateAttendanceMap.get(date) || new Map();

        const attendees = allUsers
          .filter((user) => !query.attendeeId || user.id === query.attendeeId)
          .map((user) => {
            const dayAttendances = userMap.get(user.id) || [];

            if (dayAttendances.length === 0) {
              // No attendance for this user on this date
              return {
                name: user.profile?.name || 'Unknown',
                enrollId: user.deviceEnrollId || null,
                departmentName: user.department?.name || 'Branch Default Shift',
                startTime: '00:00:00',
                endTime: '00:00:00',
                duration: '0s',
                status: AttendanceStatus.NO_WORK,
              };
            }

            // Sort by time to get first and last attendance
            const sortedAttendances = dayAttendances.sort(
              (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
            );

            const startTime = format(
              // toZonedTime(sortedAttendances[0].time, branch.timezone),
              sortedAttendances[0].time,
              'HH:mm:ss',
            );

            // Check if there's more than one attendance (clock-in and clock-out)
            let endTime: string;
            let duration: string;

            if (sortedAttendances.length > 1) {
              // Has both clock-in and clock-out
              endTime = format(
                // toZonedTime(
                //   sortedAttendances[sortedAttendances.length - 1].time,
                //   branch.timezone,
                // ),
                sortedAttendances[sortedAttendances.length - 1].time,
                'HH:mm:ss',
              );
              duration = getHumanReadableDuration(startTime, endTime);
            } else {
              // Only clock-in, no clock-out
              endTime = startTime; // Same as start time
              duration = '0s'; // Duration is 0
            }

            return {
              name: user.profile?.name || 'Unknown',
              enrollId: user.deviceEnrollId || null,
              departmentName: user.department?.name || 'Branch Default Shift',
              startTime,
              endTime,
              duration,
              status: AttendanceStatus.PRESENT,
            };
          });

        return {
          date,
          day: formatDate(new Date(date), 'EEE'), // Mon, Tue, Wed, etc.
          attendees,
        };
      });

      return result;
    } catch (error) {
      handleError(error);
    }
  }

  private mapDeviceMode(mode: number): DeviceMode {
    switch (mode) {
      case 0:
        return DeviceMode.UI_MGLOG_CLOSED;
      case 1:
        return DeviceMode.UI_MGLOG_OPENED;
      case 2:
        return DeviceMode.UI_MGLOG_HAND_OPEN;
      case 3:
        return DeviceMode.UI_MGLOG_PROG_OPEN;
      case 4:
        return DeviceMode.UI_MGLOG_PROG_CLOSE;
      case 5:
        return DeviceMode.UI_MGLOG_ILLEGAL_OPEN;
      case 6:
        return DeviceMode.UI_MGLOG_ILLEGAL_REMOVE;
      case 7:
        return DeviceMode.UI_MGLOG_ALARM;
      case 8:
        return DeviceMode.UI_MGLOG_BOOT;
      default:
        throw new Error('Invalid device mode');
    }
  }
}
