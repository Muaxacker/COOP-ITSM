import { PrismaClient, Role, Priority, RequestStatus, ActivityAction, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BankCare database...');

  // ─── Clean existing data ───────────────────────────────────────────────
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.requestActivity.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // ─── Departments ────────────────────────────────────────────────────────
  const depts = await prisma.department.createManyAndReturn({
    data: [
      { name: 'Card Operations', description: 'Handles ATM and card-related issues' },
      { name: 'Digital Banking', description: 'Mobile banking and online services' },
      { name: 'Transfer Operations', description: 'Fund transfers and remittances' },
      { name: 'Account Services', description: 'Account management and general inquiries' },
      { name: 'Customer Service', description: 'General complaints and escalations' },
    ],
  });

  const deptMap: Record<string, string> = {};
  depts.forEach((d) => { deptMap[d.name] = d.id; });

  // ─── Service Categories ────────────────────────────────────────────────
  const categories = await prisma.serviceCategory.createManyAndReturn({
    data: [
      {
        name: 'ATM Services',
        description: 'ATM card issues, cash dispensing problems, card retention',
        departmentId: deptMap['Card Operations'],
        defaultDeadlineHours: 8,
        defaultPriority: Priority.HIGH,
      },
      {
        name: 'Card Services',
        description: 'Debit/credit card issues, card replacement, fraud',
        departmentId: deptMap['Card Operations'],
        defaultDeadlineHours: 12,
        defaultPriority: Priority.HIGH,
      },
      {
        name: 'Mobile Banking',
        description: 'App login issues, transaction problems, account access',
        departmentId: deptMap['Digital Banking'],
        defaultDeadlineHours: 24,
        defaultPriority: Priority.MEDIUM,
      },
      {
        name: 'Transfer Issues',
        description: 'Failed transfers, missing funds, delayed payments',
        departmentId: deptMap['Transfer Operations'],
        defaultDeadlineHours: 24,
        defaultPriority: Priority.HIGH,
      },
      {
        name: 'Account Services',
        description: 'Account updates, statements, KYC, closures',
        departmentId: deptMap['Account Services'],
        defaultDeadlineHours: 48,
        defaultPriority: Priority.MEDIUM,
      },
      {
        name: 'General Complaint',
        description: 'Service quality, staff behaviour, general dissatisfaction',
        departmentId: deptMap['Customer Service'],
        defaultDeadlineHours: 48,
        defaultPriority: Priority.LOW,
      },
    ],
  });

  const catMap: Record<string, string> = {};
  categories.forEach((c) => { catMap[c.name] = c.id; });

  // ─── Password hash ─────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Password123!', 12);

  // ─── Users ─────────────────────────────────────────────────────────────
  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@bankcare.demo',
      passwordHash: hash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Manager
  const manager = await prisma.user.create({
    data: {
      name: 'Fatima Al-Hassan',
      email: 'fatima@bankcare.demo',
      passwordHash: hash,
      role: Role.MANAGER,
      departmentId: deptMap['Customer Service'],
      isActive: true,
    },
  });

  // Officers
  const sara = await prisma.user.create({
    data: {
      name: 'Sara Ahmed',
      email: 'sara@bankcare.demo',
      passwordHash: hash,
      role: Role.OFFICER,
      departmentId: deptMap['Card Operations'],
      isActive: true,
    },
  });

  const khalid = await prisma.user.create({
    data: {
      name: 'Khalid Omar',
      email: 'khalid@bankcare.demo',
      passwordHash: hash,
      role: Role.OFFICER,
      departmentId: deptMap['Card Operations'],
      isActive: true,
    },
  });

  const yonas = await prisma.user.create({
    data: {
      name: 'Yonas Tesfaye',
      email: 'yonas@bankcare.demo',
      passwordHash: hash,
      role: Role.OFFICER,
      departmentId: deptMap['Digital Banking'],
      isActive: true,
    },
  });

  const hana = await prisma.user.create({
    data: {
      name: 'Hana Bekele',
      email: 'hana@bankcare.demo',
      passwordHash: hash,
      role: Role.OFFICER,
      departmentId: deptMap['Transfer Operations'],
      isActive: true,
    },
  });

  // Customers
  const ahmed = await prisma.user.create({
    data: {
      name: 'Ahmed Mohammed',
      email: 'ahmed@bankcare.demo',
      passwordHash: hash,
      role: Role.CUSTOMER,
      isActive: true,
    },
  });

  const liya = await prisma.user.create({
    data: {
      name: 'Liya Girma',
      email: 'liya@bankcare.demo',
      passwordHash: hash,
      role: Role.CUSTOMER,
      isActive: true,
    },
  });

  const dawit = await prisma.user.create({
    data: {
      name: 'Dawit Haile',
      email: 'dawit@bankcare.demo',
      passwordHash: hash,
      role: Role.CUSTOMER,
      isActive: true,
    },
  });

  const meron = await prisma.user.create({
    data: {
      name: 'Meron Tadesse',
      email: 'meron@bankcare.demo',
      passwordHash: hash,
      role: Role.CUSTOMER,
      isActive: true,
    },
  });

  const abel = await prisma.user.create({
    data: {
      name: 'Abel Worku',
      email: 'abel@bankcare.demo',
      passwordHash: hash,
      role: Role.CUSTOMER,
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // ─── Helper: create a full request with activities ─────────────────────
  async function makeRequest(params: {
    num: string;
    customerId: string;
    categoryId: string;
    officerId?: string;
    title: string;
    description: string;
    priority: Priority;
    status: RequestStatus;
    createdHoursAgo: number;
    deadlineHours: number;
    resolvedHoursAgo?: number;
    activities: Array<{
      userId: string;
      action: ActivityAction;
      description: string;
      isCustomerVisible: boolean;
      hoursAfterCreation: number;
    }>;
    withFeedback?: { rating: number; comment: string };
  }) {
    const createdAt = new Date(Date.now() - params.createdHoursAgo * 3600_000);
    const deadline = new Date(createdAt.getTime() + params.deadlineHours * 3600_000);
    const resolvedAt = params.resolvedHoursAgo
      ? new Date(Date.now() - params.resolvedHoursAgo * 3600_000)
      : null;

    const request = await prisma.serviceRequest.create({
      data: {
        requestNumber: params.num,
        customerId: params.customerId,
        categoryId: params.categoryId,
        assignedOfficerId: params.officerId || null,
        title: params.title,
        description: params.description,
        priority: params.priority,
        status: params.status,
        deadline,
        createdAt,
        resolvedAt,
        closedAt:
          params.status === RequestStatus.CLOSED ? new Date(Date.now() - 1800_000) : null,
      },
    });

    for (const act of params.activities) {
      await prisma.requestActivity.create({
        data: {
          requestId: request.id,
          userId: act.userId,
          action: act.action,
          description: act.description,
          isCustomerVisible: act.isCustomerVisible,
          createdAt: new Date(createdAt.getTime() + act.hoursAfterCreation * 3600_000),
        },
      });
    }

    if (params.withFeedback) {
      await prisma.feedback.create({
        data: {
          requestId: request.id,
          customerId: params.customerId,
          rating: params.withFeedback.rating,
          comment: params.withFeedback.comment,
        },
      });
    }

    return request;
  }

  // ─── Service Requests ──────────────────────────────────────────────────

  // SR-2026-00001: Ahmed — ATM Card Retained — INVESTIGATING (the demo request)
  const req1 = await makeRequest({
    num: 'SR-2026-00001',
    customerId: ahmed.id,
    categoryId: catMap['ATM Services'],
    officerId: khalid.id,
    title: 'ATM Card Retained',
    description: 'The ATM at Hawassa Main Branch retained my card after I entered my PIN correctly. The machine displayed an error and returned neither my card nor the cash I requested.',
    priority: Priority.HIGH,
    status: RequestStatus.INVESTIGATING,
    createdHoursAgo: 5,
    deadlineHours: 8,
    activities: [
      { userId: ahmed.id, action: ActivityAction.REQUEST_CREATED, description: 'Request SR-2026-00001 submitted by customer', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: khalid.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Request has been reviewed', isCustomerVisible: true, hoursAfterCreation: 0.5 },
      { userId: khalid.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Request assigned to Khalid Omar', isCustomerVisible: true, hoursAfterCreation: 0.5 },
      { userId: khalid.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Investigation started — contacting ATM operations team', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: khalid.id, action: ActivityAction.NOTE_ADDED, description: 'ATM log shows card jam at 09:45. Engineering team dispatched.', isCustomerVisible: false, hoursAfterCreation: 2 },
    ],
  });

  // SR-2026-00002: Ahmed — Transfer Issue — RESOLVED
  const req2 = await makeRequest({
    num: 'SR-2026-00002',
    customerId: ahmed.id,
    categoryId: catMap['Transfer Issues'],
    officerId: hana.id,
    title: 'Transfer to Abissinia Bank Not Received',
    description: 'I transferred ETB 15,000 to my relative\'s Abissinia Bank account two days ago. The amount was debited from my account but the recipient has not received it.',
    priority: Priority.HIGH,
    status: RequestStatus.RESOLVED,
    createdHoursAgo: 36,
    deadlineHours: 24,
    resolvedHoursAgo: 2,
    activities: [
      { userId: ahmed.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted by customer', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: hana.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Request reviewed', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: hana.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Hana Bekele', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: hana.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Investigation started — checking SWIFT/local interbank logs', isCustomerVisible: true, hoursAfterCreation: 3 },
      { userId: hana.id, action: ActivityAction.RESOLVED, description: 'Transfer was delayed due to interbank reconciliation. Funds have been confirmed and will reflect within 24 hours.', isCustomerVisible: true, hoursAfterCreation: 34 },
    ],
    withFeedback: { rating: 4, comment: 'Resolved but took longer than expected. Officer was helpful.' },
  });

  // SR-2026-00003: Ahmed — Mobile Banking — CLOSED
  await makeRequest({
    num: 'SR-2026-00003',
    customerId: ahmed.id,
    categoryId: catMap['Mobile Banking'],
    officerId: yonas.id,
    title: 'Cannot Login to Mobile Banking App',
    description: 'I have been locked out of the mobile banking app since yesterday morning. I tried resetting my password but the OTP is not arriving.',
    priority: Priority.MEDIUM,
    status: RequestStatus.CLOSED,
    createdHoursAgo: 72,
    deadlineHours: 24,
    resolvedHoursAgo: 24,
    activities: [
      { userId: ahmed.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: yonas.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Request reviewed', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: yonas.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Yonas Tesfaye', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: yonas.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Checking OTP gateway and account lock status', isCustomerVisible: true, hoursAfterCreation: 4 },
      { userId: yonas.id, action: ActivityAction.RESOLVED, description: 'Account was locked due to 3 failed attempts. Account unlocked and OTP gateway confirmed working.', isCustomerVisible: true, hoursAfterCreation: 20 },
      { userId: ahmed.id, action: ActivityAction.CLOSED, description: 'Customer confirmed resolution and submitted 5-star feedback', isCustomerVisible: true, hoursAfterCreation: 48 },
    ],
    withFeedback: { rating: 5, comment: 'Excellent service! Issue resolved quickly.' },
  });

  // SR-2026-00004: Liya — OVERDUE
  await makeRequest({
    num: 'SR-2026-00004',
    customerId: liya.id,
    categoryId: catMap['ATM Services'],
    officerId: sara.id,
    title: 'ATM Dispensed Wrong Amount',
    description: 'I requested ETB 2,000 from the ATM at Dire Dawa branch but only ETB 1,500 was dispensed. The full amount was deducted from my balance.',
    priority: Priority.HIGH,
    status: RequestStatus.OVERDUE,
    createdHoursAgo: 15,
    deadlineHours: 8,
    activities: [
      { userId: liya.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: sara.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Request reviewed', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: sara.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Sara Ahmed', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: sara.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Contacting ATM operations for cash balance audit', isCustomerVisible: true, hoursAfterCreation: 4 },
    ],
  });

  // SR-2026-00005: Dawit — ESCALATED
  await makeRequest({
    num: 'SR-2026-00005',
    customerId: dawit.id,
    categoryId: catMap['Transfer Issues'],
    officerId: hana.id,
    title: 'International Wire Transfer Missing',
    description: 'I sent USD 500 via international wire transfer 3 days ago. The funds were debited but the recipient in Dubai has not received them. SWIFT reference: ABCD20261234.',
    priority: Priority.HIGH,
    status: RequestStatus.ESCALATED,
    createdHoursAgo: 72,
    deadlineHours: 24,
    activities: [
      { userId: dawit.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: hana.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed — high value international transfer', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: hana.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Hana Bekele', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: hana.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Contacting correspondent bank', isCustomerVisible: true, hoursAfterCreation: 3 },
      { userId: hana.id, action: ActivityAction.ESCALATED, description: 'Escalated to manager: International wire requires SWIFT team intervention. Correspondent bank not responding within SLA.', isCustomerVisible: false, hoursAfterCreation: 24 },
    ],
  });

  // SR-2026-00006: Meron — NEW (just created)
  await makeRequest({
    num: 'SR-2026-00006',
    customerId: meron.id,
    categoryId: catMap['Card Services'],
    title: 'Debit Card Blocked Unexpectedly',
    description: 'My debit card was blocked this morning without any notification. I am unable to make purchases or withdrawals. I did not perform any suspicious transactions.',
    priority: Priority.HIGH,
    status: RequestStatus.NEW,
    createdHoursAgo: 1,
    deadlineHours: 12,
    activities: [
      { userId: meron.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted by customer', isCustomerVisible: true, hoursAfterCreation: 0 },
    ],
  });

  // SR-2026-00007: Liya — ASSIGNED  
  await makeRequest({
    num: 'SR-2026-00007',
    customerId: liya.id,
    categoryId: catMap['Mobile Banking'],
    officerId: yonas.id,
    title: 'Transaction History Not Loading',
    description: 'The transaction history section in the mobile app has been showing a loading spinner for 3 days. I need to review my transactions for the past month.',
    priority: Priority.MEDIUM,
    status: RequestStatus.ASSIGNED,
    createdHoursAgo: 8,
    deadlineHours: 24,
    activities: [
      { userId: liya.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: yonas.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Request reviewed', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: yonas.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Yonas Tesfaye', isCustomerVisible: true, hoursAfterCreation: 1 },
    ],
  });

  // SR-2026-00008: Dawit — RESOLVED
  await makeRequest({
    num: 'SR-2026-00008',
    customerId: dawit.id,
    categoryId: catMap['Account Services'],
    officerId: sara.id,
    title: 'Account Statement Request for Visa Application',
    description: 'I urgently need a 6-month certified bank statement for my visa application. The embassy requires it within 3 days.',
    priority: Priority.MEDIUM,
    status: RequestStatus.RESOLVED,
    createdHoursAgo: 48,
    deadlineHours: 48,
    resolvedHoursAgo: 6,
    activities: [
      { userId: dawit.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: sara.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed — urgent visa requirement', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: sara.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Sara Ahmed', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: sara.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Processing certified statement', isCustomerVisible: true, hoursAfterCreation: 4 },
      { userId: sara.id, action: ActivityAction.RESOLVED, description: 'Certified 6-month statement prepared. Customer can collect from Hawassa Main Branch or receive via secure email.', isCustomerVisible: true, hoursAfterCreation: 42 },
    ],
  });

  // SR-2026-00009: Meron — REOPENED
  await makeRequest({
    num: 'SR-2026-00009',
    customerId: meron.id,
    categoryId: catMap['ATM Services'],
    officerId: khalid.id,
    title: 'Card Retained at Addis Ababa Branch ATM',
    description: 'The ATM at Bole Road branch retained my card on Friday at approximately 2:30 PM.',
    priority: Priority.HIGH,
    status: RequestStatus.REOPENED,
    createdHoursAgo: 96,
    deadlineHours: 8,
    activities: [
      { userId: meron.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: khalid.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: khalid.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Khalid Omar', isCustomerVisible: true, hoursAfterCreation: 1 },
      { userId: khalid.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Contacting branch security to retrieve card', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: khalid.id, action: ActivityAction.RESOLVED, description: 'Card retrieved. Customer notified to collect from branch.', isCustomerVisible: true, hoursAfterCreation: 5 },
      { userId: meron.id, action: ActivityAction.REOPENED, description: 'Customer reopened request: I went to collect the card but was told it was destroyed as per policy. I need a replacement card.', isCustomerVisible: true, hoursAfterCreation: 12 },
    ],
  });

  // SR-2026-00010: Abel — NEW, deadline approaching
  await makeRequest({
    num: 'SR-2026-00010',
    customerId: abel.id,
    categoryId: catMap['Card Services'],
    title: 'Credit Card Fraud Dispute',
    description: 'I noticed two unauthorized transactions on my credit card statement: ETB 3,200 at an online merchant on 24 Aug and ETB 5,500 at another store on 25 Aug. I did not authorize these payments.',
    priority: Priority.HIGH,
    status: RequestStatus.NEW,
    createdHoursAgo: 10,
    deadlineHours: 12,
    activities: [
      { userId: abel.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
    ],
  });

  // SR-2026-00011: Abel — INVESTIGATING
  await makeRequest({
    num: 'SR-2026-00011',
    customerId: abel.id,
    categoryId: catMap['General Complaint'],
    officerId: sara.id,
    title: 'Long Wait Time at Customer Service Desk',
    description: 'I visited the Hawassa Main Branch on Monday and waited over 2 hours to speak to a customer service officer despite having an appointment. This is unacceptable.',
    priority: Priority.LOW,
    status: RequestStatus.INVESTIGATING,
    createdHoursAgo: 24,
    deadlineHours: 48,
    activities: [
      { userId: abel.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: sara.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed — customer satisfaction issue', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: sara.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Sara Ahmed', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: sara.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Reviewing appointment logs and interviewing branch supervisor', isCustomerVisible: true, hoursAfterCreation: 4 },
      { userId: sara.id, action: ActivityAction.NOTE_ADDED, description: 'Branch logs confirm 2+ hour wait. Escalation path: branch manager apology letter.', isCustomerVisible: false, hoursAfterCreation: 6 },
    ],
  });

  // SR-2026-00012: Liya — CLOSED with feedback
  await makeRequest({
    num: 'SR-2026-00012',
    customerId: liya.id,
    categoryId: catMap['Account Services'],
    officerId: yonas.id,
    title: 'Update Registered Phone Number',
    description: 'I changed my phone number and need to update it in the banking system so I can receive OTPs on my new number.',
    priority: Priority.LOW,
    status: RequestStatus.CLOSED,
    createdHoursAgo: 120,
    deadlineHours: 48,
    resolvedHoursAgo: 48,
    activities: [
      { userId: liya.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: yonas.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed — identity verification required', isCustomerVisible: true, hoursAfterCreation: 3 },
      { userId: yonas.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Yonas Tesfaye', isCustomerVisible: true, hoursAfterCreation: 3 },
      { userId: yonas.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Requested customer to verify identity via branch visit', isCustomerVisible: true, hoursAfterCreation: 5 },
      { userId: yonas.id, action: ActivityAction.RESOLVED, description: 'Phone number updated after successful identity verification at Hawassa Main Branch.', isCustomerVisible: true, hoursAfterCreation: 24 },
      { userId: liya.id, action: ActivityAction.CLOSED, description: 'Customer confirmed and submitted feedback', isCustomerVisible: true, hoursAfterCreation: 70 },
    ],
    withFeedback: { rating: 5, comment: 'Quick and professional. Very satisfied.' },
  });

  // SR-2026-00013: Dawit — OVERDUE (more dramatic)
  await makeRequest({
    num: 'SR-2026-00013',
    customerId: dawit.id,
    categoryId: catMap['Transfer Issues'],
    officerId: hana.id,
    title: 'Duplicate Debit on Account',
    description: 'My account was debited twice for the same transaction — ETB 8,000 on the same day for a single payment to a supplier. This has caused my account to go overdrawn.',
    priority: Priority.HIGH,
    status: RequestStatus.OVERDUE,
    createdHoursAgo: 30,
    deadlineHours: 24,
    activities: [
      { userId: dawit.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: hana.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: hana.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Hana Bekele', isCustomerVisible: true, hoursAfterCreation: 2 },
    ],
  });

  // SR-2026-00014: Abel — ASSIGNED (deadline approaching in 2 hours)
  await makeRequest({
    num: 'SR-2026-00014',
    customerId: abel.id,
    categoryId: catMap['Mobile Banking'],
    officerId: yonas.id,
    title: 'Beneficiary Not Saving in Mobile App',
    description: 'Every time I try to save a new beneficiary in the mobile banking app, it shows a success message but the beneficiary does not appear in the list on the next visit.',
    priority: Priority.MEDIUM,
    status: RequestStatus.ASSIGNED,
    createdHoursAgo: 22,
    deadlineHours: 24,
    activities: [
      { userId: abel.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: yonas.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed — likely a sync issue', isCustomerVisible: true, hoursAfterCreation: 4 },
      { userId: yonas.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Yonas Tesfaye', isCustomerVisible: true, hoursAfterCreation: 4 },
    ],
  });

  // SR-2026-00015: Meron — RESOLVED waiting for feedback
  await makeRequest({
    num: 'SR-2026-00015',
    customerId: meron.id,
    categoryId: catMap['General Complaint'],
    officerId: khalid.id,
    title: 'ATM Receipt Shows Incorrect Balance',
    description: 'The ATM receipt shows my balance as ETB 0 but my mobile app shows the correct balance of ETB 12,500. This is confusing and concerning.',
    priority: Priority.MEDIUM,
    status: RequestStatus.RESOLVED,
    createdHoursAgo: 20,
    deadlineHours: 48,
    resolvedHoursAgo: 3,
    activities: [
      { userId: meron.id, action: ActivityAction.REQUEST_CREATED, description: 'Request submitted', isCustomerVisible: true, hoursAfterCreation: 0 },
      { userId: khalid.id, action: ActivityAction.REQUEST_REVIEWED, description: 'Reviewed — ATM display issue', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: khalid.id, action: ActivityAction.REQUEST_ASSIGNED, description: 'Assigned to Khalid Omar', isCustomerVisible: true, hoursAfterCreation: 2 },
      { userId: khalid.id, action: ActivityAction.INVESTIGATION_STARTED, description: 'Investigating ATM receipt printing configuration', isCustomerVisible: true, hoursAfterCreation: 3 },
      { userId: khalid.id, action: ActivityAction.RESOLVED, description: 'Confirmed this is an ATM receipt printer configuration issue showing cached data. The actual account balance is correct. ATM maintenance team scheduled. Customer account is unaffected.', isCustomerVisible: true, hoursAfterCreation: 17 },
    ],
  });

  console.log('✅ Service requests created (15)');

  // ─── Notifications ─────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      // Ahmed
      {
        userId: ahmed.id,
        requestId: req1.id,
        title: 'Investigation started',
        message: 'An officer has started investigating your ATM Card Retained request.',
        type: NotificationType.REQUEST_UPDATE,
        isRead: false,
      },
      {
        userId: ahmed.id,
        requestId: req2.id,
        title: 'Your request has been resolved',
        message: 'Request SR-2026-00002 (Transfer to Abissinia Bank) has been resolved.',
        type: NotificationType.RESOLUTION,
        isRead: true,
      },
      // Khalid
      {
        userId: khalid.id,
        requestId: req1.id,
        title: 'New request assigned to you',
        message: 'SR-2026-00001 – ATM Card Retained has been assigned to you.',
        type: NotificationType.ASSIGNMENT,
        isRead: true,
      },
      // Fatima (manager)
      {
        userId: manager.id,
        title: 'Requests need attention',
        message: '3 requests are currently overdue and require management review.',
        type: NotificationType.OVERDUE,
        isRead: false,
      },
      {
        userId: manager.id,
        title: 'Request escalated',
        message: 'SR-2026-00005 – International Wire Transfer has been escalated and requires your attention.',
        type: NotificationType.ESCALATION,
        isRead: false,
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('\n🎉 Seed complete! Demo accounts:');
  console.log('   Customer: ahmed@bankcare.demo / Password123!');
  console.log('   Officer:  sara@bankcare.demo  / Password123!');
  console.log('   Manager:  fatima@bankcare.demo / Password123!');
  console.log('   Admin:    admin@bankcare.demo  / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
