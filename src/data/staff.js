/**
 * Staff screen data.
 *
 * Transcribed from the Figma Staff screens (nodes 1181:84436, 1181:84672) and
 * the staff detail dialog (1181:84909/36/54/72). Replace with the Django API;
 * StaffPage, AttendancePage and StaffDetailDialog expect these shapes.
 *
 * DATA QUALITY, transcribed faithfully rather than silently corrected (same
 * policy as data/clients.js and data/finance.js):
 *   - Every row is "Arjun Verma" - the mockup never varies the name.
 *   - The list's Salary column reads ₹68,000 for every row, but the same
 *     person's Salary tab in the detail dialog reads ₹85,000 Monthly. Both
 *     are preserved as designed rather than reconciled.
 *
 * NOT A BUG, preserved deliberately: the list table shows a masked phone
 * ("+91 XXXXX XXXXX") while the detail dialog's Overview tab reveals the real
 * number. That is a real privacy pattern in the design, not missing data, so
 * `phoneMasked` and `phone` are modelled as two different fields.
 */

export const ROLES = ["Order Manager", "Finance Manager"];

export const STAFF = [
  {
    id: "staff-1",
    name: "Arjun Verma",
    phoneMasked: "+91 XXXXX XXXXX",
    phone: "+91 98100 22113",
    email: "arjun@shivalik.in",
    role: "Order Manager",
    department: "Manager",
    salaryListed: "₹68,000",
    salaryMonthly: "₹85,000",
    contractType: "Full-time",
    lastPayout: "31 May 2026",
    joined: "01 Apr 2022",
    contractFile: "file123456",
    // Badge shown next to the role in the detail dialog - the job this
    // person is currently engaged on, not an account status.
    currentTask: "In Printing",
  },
  {
    id: "staff-2",
    name: "Arjun Verma",
    phoneMasked: "+91 XXXXX XXXXX",
    phone: "+91 98100 22113",
    email: "arjun@shivalik.in",
    role: "Order Manager",
    department: "Manager",
    salaryListed: "₹68,000",
    salaryMonthly: "₹85,000",
    contractType: "Full-time",
    lastPayout: "31 May 2026",
    joined: "01 Apr 2022",
    contractFile: "file123456",
    currentTask: "In Printing",
  },
  {
    id: "staff-3",
    name: "Arjun Verma",
    phoneMasked: "+91 XXXXX XXXXX",
    phone: "+91 98100 22113",
    email: "arjun@shivalik.in",
    role: "Order Manager",
    department: "Manager",
    salaryListed: "₹68,000",
    salaryMonthly: "₹85,000",
    contractType: "Full-time",
    lastPayout: "31 May 2026",
    joined: "01 Apr 2022",
    contractFile: "file123456",
    currentTask: "In Printing",
  },
  {
    id: "staff-4",
    name: "Arjun Verma",
    phoneMasked: "+91 XXXXX XXXXX",
    phone: "+91 98100 22113",
    email: "arjun@shivalik.in",
    role: "Finance Manager",
    department: "Manager",
    salaryListed: "₹68,000",
    salaryMonthly: "₹85,000",
    contractType: "Full-time",
    lastPayout: "31 May 2026",
    joined: "01 Apr 2022",
    contractFile: "file123456",
    currentTask: "In Printing",
  },
  {
    id: "staff-5",
    name: "Arjun Verma",
    phoneMasked: "+91 XXXXX XXXXX",
    phone: "+91 98100 22113",
    email: "arjun@shivalik.in",
    role: "Order Manager",
    department: "Manager",
    salaryListed: "₹68,000",
    salaryMonthly: "₹85,000",
    contractType: "Full-time",
    lastPayout: "31 May 2026",
    joined: "01 Apr 2022",
    contractFile: "file123456",
    currentTask: "In Printing",
  },
  {
    id: "staff-6",
    name: "Arjun Verma",
    phoneMasked: "+91 XXXXX XXXXX",
    phone: "+91 98100 22113",
    email: "arjun@shivalik.in",
    role: "Finance Manager",
    department: "Manager",
    salaryListed: "₹68,000",
    salaryMonthly: "₹85,000",
    contractType: "Full-time",
    lastPayout: "31 May 2026",
    joined: "01 Apr 2022",
    contractFile: "file123456",
    currentTask: "In Printing",
  },
  {
    id: "staff-7",
    name: "Arjun Verma",
    phoneMasked: "+91 XXXXX XXXXX",
    phone: "+91 98100 22113",
    email: "arjun@shivalik.in",
    role: "Order Manager",
    department: "Manager",
    salaryListed: "₹68,000",
    salaryMonthly: "₹85,000",
    contractType: "Full-time",
    lastPayout: "31 May 2026",
    joined: "01 Apr 2022",
    contractFile: "file123456",
    currentTask: "In Printing",
  },
];

/** Top stat row on the Attendance page - same figures as the Dashboard's own
 * Staff Overview preview of this data (node 1181:84698 / 790:22391). */
export const ATTENDANCE_OVERVIEW = [
  { label: "TOTAL STAFF", value: "7" },
  { label: "PRESENT TODAY", value: "5" },
  { label: "ABSENT TODAY", value: "2" },
  { label: "TODAY'S RATE", value: "71%" },
];

export const MONTHLY_ATTENDANCE = {
  title: "Monthly Attendance- June 2026",
  stats: [
    { label: "TOTAL MAN DAYS", value: "17/30" },
    { label: "PERFECT ATTENDANCE", value: "1" },
    { label: "BELOW 15 DAYS", value: "7" },
    { label: "AVG EMPLOYEE", value: "10 days" },
  ],
};

/**
 * The Attendance page's row table (node 1181:84722). Three rows are pending
 * a decision (dropdown editable, Reject/Approve shown); two are decided
 * (dropdown locked, outcome badge shown instead) - see AttendanceDecision.
 */
export const ATTENDANCE_ROWS = [
  { id: "att-1", staffId: "staff-1", name: "Arjun Verma", state: "Present", outcome: null, attendance: "28/30" },
  { id: "att-2", staffId: "staff-2", name: "Arjun Verma", state: "Half day", outcome: null, attendance: "28/30" },
  { id: "att-3", staffId: "staff-3", name: "Arjun Verma", state: "Present", outcome: null, attendance: "28/30" },
  { id: "att-4", staffId: "staff-4", name: "Arjun Verma", state: "Late", outcome: "approved", attendance: "28/30" },
  { id: "att-5", staffId: "staff-5", name: "Arjun Verma", state: "Present", outcome: "rejected", attendance: "28/30" },
];

/**
 * The detail dialog's Attendance tab (node 1181:84936): three stat tiles plus
 * a 3-month history. Every staff record shares this - the mockup shows one
 * person's history and there is no per-employee data to vary it by.
 */
export const STAFF_ATTENDANCE_STATS = [
  { label: "Present", value: "13" },
  { label: "Absent", value: "1" },
  { label: "Rate", value: "98" },
];

export const ATTENDANCE_MONTHS = [
  { year: 2022, month: 0, label: "January 2022" },
  { year: 2022, month: 1, label: "February 2022" },
  { year: 2022, month: 2, label: "March 2022" },
];

export const ATTENDANCE_TODAY = "2022-02-15";

/**
 * Every weekday from 1 Jan to 15 Feb 2022 (the "today" marker) is present
 * except one, matching the calendar's illustrative Present/Absent split - see
 * AttendanceCalendar for why this isn't algebraically tied to the 13/1/98
 * figures above it.
 */
export function buildPresentDates() {
  const present = new Set();
  const absentDate = "2022-01-10";

  for (
    let d = new Date(2022, 0, 1);
    d <= new Date(2022, 1, 15);
    d.setDate(d.getDate() + 1)
  ) {
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // weekends aren't tracked as present

    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    if (iso !== absentDate) present.add(iso);
  }

  return present;
}
