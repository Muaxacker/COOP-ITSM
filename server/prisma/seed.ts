import { PrismaClient, Role, Priority, IncidentStatus, DivisionCode, ActivityAction, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting COOP-ITSM database seed...');

  const userCount = await prisma.user.count();
  if (userCount > 0 && process.env.FORCE_SEED !== 'true') {
    console.log(`ℹ️ Database already initialized with ${userCount} users. Skipping seed.`);
    return;
  }

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.troubleshootingLog.deleteMany();
  await prisma.incidentUpdate.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.incidentCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.division.deleteMany();

  console.log('🧹 Existing data cleaned.');

  // 2. Seed Branches (Ethiopian COOP Branches)
  const branchesData = [
    { name: 'Hawassa Branch', code: 'BR001', location: 'Hawassa, Sidama Region', phone: '+251 46 220 1122' },
    { name: 'Bole Branch', code: 'BR002', location: 'Bole Medhanealem, Addis Ababa', phone: '+251 11 662 3344' },
    { name: 'Finfinnee Branch', code: 'BR003', location: 'Kazanchis, Addis Ababa', phone: '+251 11 551 5566' },
    { name: 'Jimma Branch', code: 'BR004', location: 'Jimma Town, Oromia', phone: '+251 47 111 7788' },
    { name: 'Adama Branch', code: 'BR005', location: 'Adama Main Road, Oromia', phone: '+251 22 112 9900' },
    { name: 'Shashemene Branch', code: 'BR006', location: 'Shashemene Center, Oromia', phone: '+251 46 110 3344' },
    { name: 'Nekemte Branch', code: 'BR007', location: 'Nekemte Town, Oromia', phone: '+251 57 661 2233' },
    { name: 'Dire Dawa Branch', code: 'BR008', location: 'Kebele 02, Dire Dawa', phone: '+251 25 111 4455' },
  ];

  const branches = await Promise.all(
    branchesData.map((b) => prisma.branch.create({ data: b }))
  );
  const branchMap = new Map(branches.map((b) => [b.code, b]));
  console.log(`✅ Created ${branches.length} branches.`);

  // 3. Seed 4 IT Divisions
  const divisionsData = [
    {
      name: 'ATM Support Division',
      code: DivisionCode.ATM,
      description: 'Centralized ATM hardware, cash dispensers, card readers, receipt printers, and ATM network connectivity.',
    },
    {
      name: 'Application Support Division',
      code: DivisionCode.APPLICATION,
      description: 'Core banking software, teller application errors, user access control, password resets, and virus/malware recovery.',
    },
    {
      name: 'Networking Division',
      code: DivisionCode.NETWORKING,
      description: 'Branch LAN, WAN, router gateways, network switches, patch panels, ethernet cabling, and ISP connectivity.',
    },
    {
      name: 'Hardware & Maintenance Division',
      code: DivisionCode.MAINTENANCE,
      description: 'Computer workstation hardware, hard disk drives, RAM upgrades, printer hardware, power supply UPS, and terminal repairs.',
    },
  ];

  const divisions = await Promise.all(
    divisionsData.map((d) => prisma.division.create({ data: d }))
  );
  const divisionMap = new Map(divisions.map((d) => [d.code, d]));
  console.log(`✅ Created ${divisions.length} IT divisions.`);

  // 4. Seed Incident Categories
  const categoriesData = [
    // ATM
    { divisionCode: DivisionCode.ATM, name: 'ATM Offline / Out of Service', defaultPriority: Priority.CRITICAL, defaultSlaHours: 1, description: 'ATM is completely unreachable or powered down' },
    { divisionCode: DivisionCode.ATM, name: 'Cash Dispenser Malfunction', defaultPriority: Priority.CRITICAL, defaultSlaHours: 1, description: 'Cash jam, dispenser shutter failure, or miscount' },
    { divisionCode: DivisionCode.ATM, name: 'Card Reader Jam / Failure', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'Card jammed inside reader or unable to read chip' },
    { divisionCode: DivisionCode.ATM, name: 'Receipt Printer Hardware Error', defaultPriority: Priority.MEDIUM, defaultSlaHours: 24, description: 'Receipt printer out of paper, cutter jam, or communication error' },
    { divisionCode: DivisionCode.ATM, name: 'ATM Network / Host Disconnect', defaultPriority: Priority.CRITICAL, defaultSlaHours: 1, description: 'ATM cannot reach transaction authorization host' },

    // APPLICATION
    { divisionCode: DivisionCode.APPLICATION, name: 'Core Banking Application Error', defaultPriority: Priority.CRITICAL, defaultSlaHours: 1, description: 'Transaction posting error or system-wide timeout' },
    { divisionCode: DivisionCode.APPLICATION, name: 'Teller Software Crash / Freezing', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'Front-office teller workstation software unresponsive' },
    { divisionCode: DivisionCode.APPLICATION, name: 'User Account Locked / Access Control', defaultPriority: Priority.MEDIUM, defaultSlaHours: 24, description: 'Branch employee cannot log in or requires profile unlock' },
    { divisionCode: DivisionCode.APPLICATION, name: 'Password Reset Request', defaultPriority: Priority.LOW, defaultSlaHours: 72, description: 'Self-service or standard supervisor password reset' },
    { divisionCode: DivisionCode.APPLICATION, name: 'Virus / Malware Infection & OS Format', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'Trojan/malware detected on workstation requiring OS re-imaging' },

    // NETWORKING
    { divisionCode: DivisionCode.NETWORKING, name: 'Branch Internet Connectivity Failure', defaultPriority: Priority.CRITICAL, defaultSlaHours: 1, description: 'Primary and backup WAN links down across branch' },
    { divisionCode: DivisionCode.NETWORKING, name: 'LAN Switch Port Link Failure', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'Local switch port amber/off, teller lost network connection' },
    { divisionCode: DivisionCode.NETWORKING, name: 'Patch Panel / Cable Disconnection', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'Loose or damaged RJ45 cable between patch panel and workstation' },
    { divisionCode: DivisionCode.NETWORKING, name: 'Router Gateway Latency & Packet Loss', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'High ping latency affecting branch transaction speed' },
    { divisionCode: DivisionCode.NETWORKING, name: 'Workstation IP / DHCP Conflict', defaultPriority: Priority.MEDIUM, defaultSlaHours: 24, description: 'Device unable to obtain IP lease from branch router' },

    // MAINTENANCE
    { divisionCode: DivisionCode.MAINTENANCE, name: 'Hard Disk Drive Failure / OS Boot', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'SMART error or clicking noise indicating drive failure' },
    { divisionCode: DivisionCode.MAINTENANCE, name: 'RAM Memory Error / Blue Screen', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'Random memory reboot or memory module defect' },
    { divisionCode: DivisionCode.MAINTENANCE, name: 'Passbook / Slip Printer Mechanical Jam', defaultPriority: Priority.MEDIUM, defaultSlaHours: 24, description: 'Worn feed rollers or gear mechanism obstruction' },
    { divisionCode: DivisionCode.MAINTENANCE, name: 'Desktop Power Supply / UPS Failure', defaultPriority: Priority.HIGH, defaultSlaHours: 4, description: 'Workstation does not power on or UPS beeping continuously' },
    { divisionCode: DivisionCode.MAINTENANCE, name: 'Peripheral Hardware Replacement', defaultPriority: Priority.LOW, defaultSlaHours: 72, description: 'Keyboard, mouse, barcode scanner, or monitor replacement' },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) =>
      prisma.incidentCategory.create({
        data: {
          divisionId: divisionMap.get(c.divisionCode)!.id,
          name: c.name,
          description: c.description,
          defaultPriority: c.defaultPriority,
          defaultSlaHours: c.defaultSlaHours,
        },
      })
    )
  );
  console.log(`✅ Created ${categories.length} incident categories across 4 divisions.`);

  // 5. Seed Users (all password: Password123!)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usersData = [
    // System Administrator
    {
      name: 'System Administrator',
      email: 'admin@coopbank.et',
      passwordHash,
      role: Role.ADMIN,
      phone: '+251 11 550 0001',
    },
    // IT Supervisor
    {
      name: 'Chala Dejene (IT Supervisor)',
      email: 'supervisor@coopbank.et',
      passwordHash,
      role: Role.IT_SUPERVISOR,
      phone: '+251 11 550 0002',
    },
    // Technicians (1 per division)
    {
      name: 'Mohammed Kedir (Network Specialist)',
      email: 'tech.network@coopbank.et',
      passwordHash,
      role: Role.TECHNICIAN,
      divisionId: divisionMap.get(DivisionCode.NETWORKING)!.id,
      phone: '+251 91 123 4567',
    },
    {
      name: 'Biniam Tadesse (ATM Field Engineer)',
      email: 'tech.atm@coopbank.et',
      passwordHash,
      role: Role.TECHNICIAN,
      divisionId: divisionMap.get(DivisionCode.ATM)!.id,
      phone: '+251 91 234 5678',
    },
    {
      name: 'Selamawit Bekele (Software Analyst)',
      email: 'tech.app@coopbank.et',
      passwordHash,
      role: Role.TECHNICIAN,
      divisionId: divisionMap.get(DivisionCode.APPLICATION)!.id,
      phone: '+251 91 345 6789',
    },
    {
      name: 'Dawit Yohannes (Hardware Engineer)',
      email: 'tech.maint@coopbank.et',
      passwordHash,
      role: Role.TECHNICIAN,
      divisionId: divisionMap.get(DivisionCode.MAINTENANCE)!.id,
      phone: '+251 91 456 7890',
    },
    // Branch Users
    {
      name: 'Abebe Bikila (Hawassa Teller)',
      email: 'teller.hawassa@coopbank.et',
      passwordHash,
      role: Role.BRANCH_USER,
      branchId: branchMap.get('BR001')!.id,
      phone: '+251 46 220 8899',
    },
    {
      name: 'Tigist Alemu (Bole Customer Service)',
      email: 'user.bole@coopbank.et',
      passwordHash,
      role: Role.BRANCH_USER,
      branchId: branchMap.get('BR002')!.id,
      phone: '+251 11 662 9988',
    },
    {
      name: 'Kenenisa Bekele (Jimma Teller Supervisor)',
      email: 'teller.jimma@coopbank.et',
      passwordHash,
      role: Role.BRANCH_USER,
      branchId: branchMap.get('BR004')!.id,
      phone: '+251 47 111 2233',
    },
    {
      name: 'Derartu Tulu (Adama Operations)',
      email: 'user.adama@coopbank.et',
      passwordHash,
      role: Role.BRANCH_USER,
      branchId: branchMap.get('BR005')!.id,
      phone: '+251 22 112 4455',
    },
  ];

  const users = await Promise.all(usersData.map((u) => prisma.user.create({ data: u })));
  const userMap = new Map(users.map((u) => [u.email, u]));
  console.log(`✅ Created ${users.length} demo users across all roles.`);

  // 6. Pre-populate Realistic Sample Incidents

  // Helper category finder
  const findCat = (name: string) => categories.find((c) => c.name.includes(name))!;

  // Incident 1: IN_PROGRESS with detailed step-by-step troubleshooting log (from the COOP report)
  const inc1 = await prisma.incident.create({
    data: {
      incidentNumber: 'INC-2026-00001',
      title: 'Branch computers cannot access the network at teller workstation #3',
      description: 'Teller workstation #3 lost connection to the core banking server. Ethernet connection shows disconnected icon. No internet or intranet access.',
      branchId: branchMap.get('BR001')!.id,
      categoryId: findCat('Patch Panel / Cable').id,
      reportedById: userMap.get('teller.hawassa@coopbank.et')!.id,
      assignedTechnicianId: userMap.get('tech.network@coopbank.et')!.id,
      priority: Priority.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours remaining
      slaBreached: false,
      reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      assignedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    },
  });

  // Incident 1 updates
  await prisma.incidentUpdate.createMany({
    data: [
      {
        incidentId: inc1.id,
        userId: userMap.get('teller.hawassa@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_CREATED,
        message: 'Incident reported: Workstation #3 network link down at Hawassa Branch.',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        userId: userMap.get('supervisor@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_REVIEWED,
        message: 'Reviewed incident: Confirmed HIGH priority. Assigning to Networking specialist.',
        createdAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        userId: userMap.get('supervisor@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_ASSIGNED,
        message: 'Assigned to Mohammed Kedir (Networking Division).',
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        userId: userMap.get('tech.network@coopbank.et')!.id,
        action: ActivityAction.INVESTIGATION_STARTED,
        message: 'Technician Mohammed Kedir started investigation and physical inspection.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  });

  // Incident 1 Troubleshooting Logs (Directly reflecting the internship report's investigation!)
  await prisma.troubleshootingLog.createMany({
    data: [
      {
        incidentId: inc1.id,
        technicianId: userMap.get('tech.network@coopbank.et')!.id,
        action: 'Checked power and network equipment LED indicators',
        observation: 'Switch port 14 indicator light was completely off',
        result: 'No physical carrier signal on port 14',
        createdAt: new Date(Date.now() - 110 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        technicianId: userMap.get('tech.network@coopbank.et')!.id,
        action: 'Checked server connectivity and default gateway',
        observation: 'Server pinged from adjacent teller PC with 1ms round-trip',
        result: 'Confirmed server and core switch operational; issue localized to station #3 link',
        createdAt: new Date(Date.now() - 95 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        technicianId: userMap.get('tech.network@coopbank.et')!.id,
        action: 'Checked patch panel port 14 and structured cabling rack',
        observation: 'Cable in patch panel port 14 securely connected and punched down',
        result: 'Patch panel and rack side verified intact',
        createdAt: new Date(Date.now() - 80 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        technicianId: userMap.get('tech.network@coopbank.et')!.id,
        action: 'Inspected RJ45 connector and wall outlet at teller station #3',
        observation: 'RJ45 plastic retaining clip snapped off; cable pulled partially out of wall outlet',
        result: 'Found root fault: Damaged cable connector causing intermittent disconnect',
        createdAt: new Date(Date.now() - 65 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        technicianId: userMap.get('tech.network@coopbank.et')!.id,
        action: 'Re-crimped Cat6 cable with new shielded RJ45 connector and reconnected to outlet',
        observation: 'Link LED immediately lit solid green, flashing amber on activity',
        result: 'Physical layer link established at 1 Gbps Full-Duplex',
        createdAt: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        incidentId: inc1.id,
        technicianId: userMap.get('tech.network@coopbank.et')!.id,
        action: 'Conducted end-to-end network ping test and teller software verification',
        observation: '100 packets sent to Core Banking Server with 0% loss, avg latency 1.2ms',
        result: 'Network throughput and transaction processing fully verified',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    ],
  });

  // Incident 2: ATM Division - ASSIGNED
  const inc2 = await prisma.incident.create({
    data: {
      incidentNumber: 'INC-2026-00002',
      title: 'Main Lobby ATM Offline — Dispenser shutter mechanism locked',
      description: 'Lobby ATM machine went offline during morning rush. Error code E-14 displayed on maintenance monitor. Cash dispenser shutter is locked.',
      branchId: branchMap.get('BR002')!.id,
      categoryId: findCat('Cash Dispenser Malfunction').id,
      reportedById: userMap.get('user.bole@coopbank.et')!.id,
      assignedTechnicianId: userMap.get('tech.atm@coopbank.et')!.id,
      priority: Priority.CRITICAL,
      status: IncidentStatus.ASSIGNED,
      slaDeadline: new Date(Date.now() + 45 * 60 * 1000), // 45m remaining
      slaBreached: false,
      reportedAt: new Date(Date.now() - 25 * 60 * 1000),
      assignedAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  });

  await prisma.incidentUpdate.createMany({
    data: [
      {
        incidentId: inc2.id,
        userId: userMap.get('user.bole@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_CREATED,
        message: 'Critical incident reported: ATM Offline at Bole Branch.',
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        incidentId: inc2.id,
        userId: userMap.get('supervisor@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_ASSIGNED,
        message: 'Assigned immediately to ATM Field Engineer Biniam Tadesse. Critical SLA 1hr.',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    ],
  });

  // Incident 3: Application Division - RESOLVED (Waiting for Branch Confirmation!)
  const inc3 = await prisma.incident.create({
    data: {
      incidentNumber: 'INC-2026-00003',
      title: 'Teller computer infected with Trojan malware, popup advertisements preventing login',
      description: 'Workstation in customer service area showing unauthorized popup windows and antivirus warning. Browser redirected to external URLs.',
      branchId: branchMap.get('BR004')!.id,
      categoryId: findCat('Virus / Malware').id,
      reportedById: userMap.get('teller.jimma@coopbank.et')!.id,
      assignedTechnicianId: userMap.get('tech.app@coopbank.et')!.id,
      priority: Priority.HIGH,
      status: IncidentStatus.RESOLVED,
      slaDeadline: new Date(Date.now() - 30 * 60 * 1000),
      slaBreached: false,
      rootCause: 'Unauthorized USB flash drive inserted into teller workstation introducing adware and trojan binaries.',
      resolution: 'Disconnected machine from branch network. Scanned disk with offline rescue toolkit, quarantined infected files, executed automated OS cleanup and standardized bank image re-installation. Verified endpoint antivirus signature updates and enabled USB mass-storage restriction policy.',
      reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      assignedAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 45 * 60 * 1000),
    },
  });

  await prisma.incidentUpdate.createMany({
    data: [
      {
        incidentId: inc3.id,
        userId: userMap.get('teller.jimma@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_CREATED,
        message: 'Reported workstation virus infection at Jimma Branch.',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        incidentId: inc3.id,
        userId: userMap.get('supervisor@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_ASSIGNED,
        message: 'Assigned to Selamawit Bekele (Application Division).',
        createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
      },
      {
        incidentId: inc3.id,
        userId: userMap.get('tech.app@coopbank.et')!.id,
        action: ActivityAction.INVESTIGATION_STARTED,
        message: 'Isolated machine from network and began malware scan.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        incidentId: inc3.id,
        userId: userMap.get('tech.app@coopbank.et')!.id,
        action: ActivityAction.RESOLVED,
        message: 'System sanitized, re-imaged with approved bank Windows image, and verified. Awaiting branch confirmation.',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      },
    ],
  });

  // Incident 4: Maintenance Division - CLOSED (Verified by Branch)
  const inc4 = await prisma.incident.create({
    data: {
      incidentNumber: 'INC-2026-00004',
      title: 'Passbook printer paper feed jamming repeatedly during customer deposits',
      description: 'Teller passbook printer model Olivetti PR2 Plus jams on every second multi-part slip. Rollers slipping.',
      branchId: branchMap.get('BR005')!.id,
      categoryId: findCat('Passbook / Slip Printer').id,
      reportedById: userMap.get('user.adama@coopbank.et')!.id,
      assignedTechnicianId: userMap.get('tech.maint@coopbank.et')!.id,
      priority: Priority.MEDIUM,
      status: IncidentStatus.CLOSED,
      slaDeadline: new Date(Date.now() - 10 * 60 * 60 * 1000),
      slaBreached: false,
      rootCause: 'Worn paper pick-up roller assembly and micro-switch dust accumulation.',
      resolution: 'Cleaned printer interior with compressed air and isopropyl alcohol. Replaced pickup roller rubber ring and recalibrated printhead alignment.',
      reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      assignedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },
  });

  await prisma.incidentUpdate.createMany({
    data: [
      {
        incidentId: inc4.id,
        userId: userMap.get('user.adama@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_CREATED,
        message: 'Reported printer hardware malfunction at Adama Branch.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        incidentId: inc4.id,
        userId: userMap.get('supervisor@coopbank.et')!.id,
        action: ActivityAction.INCIDENT_ASSIGNED,
        message: 'Assigned to Dawit Yohannes (Maintenance Division).',
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      },
      {
        incidentId: inc4.id,
        userId: userMap.get('tech.maint@coopbank.et')!.id,
        action: ActivityAction.RESOLVED,
        message: 'Replaced rollers and calibrated print head.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        incidentId: inc4.id,
        userId: userMap.get('user.adama@coopbank.et')!.id,
        action: ActivityAction.VERIFIED_CLOSED,
        message: 'Branch confirmed: Passbook printing tested successfully on 10 slips. Case closed.',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
    ],
  });

  // Incident 5: Networking Division - OPEN (New submission awaiting supervisor review)
  const inc5 = await prisma.incident.create({
    data: {
      incidentNumber: 'INC-2026-00005',
      title: 'Branch Optical Fiber Converter showing red alarm, internet connection dropped',
      description: 'The media converter in the branch server room has a red LOS (Loss of Signal) light. All teller machines unable to connect to central database.',
      branchId: branchMap.get('BR003')!.id,
      categoryId: findCat('Branch Internet Connectivity').id,
      reportedById: userMap.get('teller.hawassa@coopbank.et')!.id,
      priority: Priority.CRITICAL,
      status: IncidentStatus.OPEN,
      slaDeadline: new Date(Date.now() + 50 * 60 * 1000), // 50m remaining
      slaBreached: false,
      reportedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: inc5.id,
      userId: userMap.get('teller.hawassa@coopbank.et')!.id,
      action: ActivityAction.INCIDENT_CREATED,
      message: 'Critical incident reported: Fiber converter red alarm at Finfinnee Branch.',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  });

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userMap.get('supervisor@coopbank.et')!.id,
        incidentId: inc5.id,
        title: 'New Critical Incident: INC-2026-00005',
        message: 'Finfinnee Branch: Branch Optical Fiber Converter showing red alarm',
        type: NotificationType.INCIDENT_CREATED,
      },
      {
        userId: userMap.get('tech.atm@coopbank.et')!.id,
        incidentId: inc2.id,
        title: 'Assigned: INC-2026-00002',
        message: 'You have been assigned to Main Lobby ATM Offline at Bole Branch',
        type: NotificationType.INCIDENT_ASSIGNED,
      },
      {
        userId: userMap.get('teller.jimma@coopbank.et')!.id,
        incidentId: inc3.id,
        title: 'Incident Resolved: INC-2026-00003',
        message: 'Malware infection resolved. Please verify if your problem is solved.',
        type: NotificationType.INCIDENT_RESOLVED,
      },
    ],
  });

  console.log(`✅ Pre-populated 5 sample incidents in various lifecycle states (OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED) with full troubleshooting logs!`);
  console.log('🎉 COOP-ITSM database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
