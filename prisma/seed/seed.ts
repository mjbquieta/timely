// import { Prisma, PrismaClient, UserType } from '@prisma/client';
// import { Logger } from '@nestjs/common';
// import { AuthService } from 'src/modules/auth/auth.service';

// const prisma = new PrismaClient();
// const logger = new Logger('Seed');

// async function main() {
//   try {
//     // Global Password
//     const password =
//       '$2b$10$kYQkcCfwe9dminXNaWC8oO4LFsvN70vLiGfqduWupH6TcEnKFs4OO';

//     const seed = await prisma.$transaction(async (prisma) => {
//       // Seed Branches
//       const branch = {
//         id: 'b0cc009d-09f8-4277-b2b3-7ec398ae7246',
//         name: 'Castle Fake 1',
//       };
//       const branchUser = await prisma.branch.upsert({
//         where: { id: branch.id },
//         update: {},
//         create: {
//           ...(branch as Prisma.BranchCreateInput),
//           users: {
//             create: {
//               type: [UserType.BRANCH_OWNER],
//               profile: {
//                 create: {
//                   name: 'castle',
//                 },
//               },
//             },
//           },
//         },
//         include: {
//           users: {
//             include: {
//               branch: false,
//               profile: true,
//             },
//           },
//         },
//       });
//       logger.log('Branch User created', branchUser);

//       // Seed Attendees
//       const attendee = {
//         id: 'da80a348-16c0-47c4-bf15-dbeb30f97187',
//         name: 'att006',
//       };
//       // Check if attendee already exists
//       const existingAttendee = await prisma.userProfile.findUnique({
//         where: { username: attendee.username },
//         include: { user: true },
//       });

//       let attendeeUser;
//       if (existingAttendee) {
//         attendeeUser = existingAttendee.user;
//         logger.log('Attendee already exists, skipping creation');
//       } else {
//         attendeeUser = await prisma.user.create({
//           data: {
//             id: attendee.id,
//             type: [UserType.ATTENDEE],
//             branchId: branchUser.id,
//             profile: {
//               create: attendee,
//             },
//           },
//         });
//         logger.log('Attendee User created', attendeeUser);
//       }
//       logger.log('Attendee User created', attendeeUser);
//       return true;
//     });
//     if (seed) {
//       logger.log('Seed completed successfully');
//     } else {
//       logger.error('Seed failed');
//     }
//   } catch (error) {
//     logger.error(error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main()
//   .catch((e) => {
//     logger.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
