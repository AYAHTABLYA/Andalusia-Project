// API payload -> UI model for the learner portal.
// ⚠️ The backend DTOs for profile / payments / dashboard were not available when
// this was written, so every field below is read defensively (camelCase or
// PascalCase, a few alias names). If a field shows up empty, this is the ONLY
// file to adjust.
import type {
  CampusOption,
  EnrollmentSummary,
  ProfileData,
  ProfileMetric,
} from "../Types/Profile";
import type { LearnerDashboard } from "../Types/Dashboard";
import type {
  PaymentStatus,
  Transaction,
  TransactionLine,
} from "../Types/Payment";

type Raw = Record<string, any>;

const cap = (k: string) => k.charAt(0).toUpperCase() + k.slice(1);

function pick<T = any>(
  obj: Raw | null | undefined,
  ...keys: string[]
): T | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k] ?? obj[cap(k)];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

// Lists may come back as [..] or { items: [..] } / { data: [..] }.
function toArray(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload;
  const p = payload as Raw | null;
  const inner = pick<Raw[]>(
    p,
    "items",
    "data",
    "results",
    "payments",
    "campuses",
  );
  return Array.isArray(inner) ? inner : [];
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return (
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " EET"
  );
}

// ---------------- Profile ----------------
function toProfile(raw: unknown): ProfileData {
  const dto = (raw ?? {}) as Raw;
  const fullName = pick<string>(dto, "fullName", "name") ?? "";
  const [fallbackFirst = "", ...rest] = fullName.trim().split(/\s+/);
  const id = pick<number | string>(
    dto,
    "studentId",
    "studentNumber",
    "userId",
    "id",
  );
  const created = pick<string>(dto, "memberSince", "createdAt", "registeredAt");
  const memberSince = created
    ? Number.isNaN(new Date(created).getTime())
      ? created
      : new Date(created).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
    : "—";

  return {
    firstName: pick<string>(dto, "firstName") ?? fallbackFirst,
    lastName: pick<string>(dto, "lastName") ?? rest.join(" "),
    title: pick<string>(dto, "title", "professionalTitle", "jobTitle") ?? "",
    email: pick<string>(dto, "email") ?? "",
    phone: pick<string>(dto, "mobileNumber", "phone", "phoneNumber") ?? "",
    campus: pick<string>(dto, "campusName", "campus") ?? "—",
    campusId: pick<number>(dto, "campusId") ?? null,
    studentId:
      id === undefined
        ? "—"
        : typeof id === "number"
          ? `#AA-${String(id).padStart(4, "0")}`
          : String(id),
    memberSince,
    photoUrl:
      pick<string>(
        dto,
        "profileImageUrl",
        "photoUrl",
        "avatarUrl",
        "imageUrl",
        "profilePicture",
      ) ?? null,
  };
}

function toCampusOptions(raw: unknown): CampusOption[] {
  return toArray(raw)
    .map((c) => ({
      id: Number(pick(c, "id", "campusId")),
      name: String(pick(c, "name", "campusName", "title") ?? ""),
    }))
    .filter((c) => Number.isFinite(c.id) && c.name);
}

// ---------------- Payments ----------------
function toStatus(value: unknown): PaymentStatus {
  const s = String(value ?? "").toLowerCase();
  if (/(paid|complete|success|settled|confirmed)/.test(s)) return "paid";
  if (/(fail|declin|reject|cancel|expire)/.test(s)) return "failed";
  return "pending";
}

function toTransaction(raw: Raw): Transaction {
  const id = String(pick(raw, "id", "paymentId", "transactionId") ?? "");
  const status = toStatus(pick(raw, "status", "paymentStatus"));
  const course =
    pick<string>(
      raw,
      "courseTitle",
      "programTitle",
      "itemTitle",
      "title",
      "description",
    ) ?? "Tuition payment";
  const amount = Number(pick(raw, "amount", "totalAmount", "total") ?? 0);
  const dateIso = pick<string>(
    raw,
    status === "paid" ? "paidAt" : "dueDate",
    "paidAt",
    "paymentDate",
    "dueDate",
    "createdAt",
  );

  const lineSource = pick<Raw[]>(
    raw,
    "lines",
    "lineItems",
    "items",
    "breakdown",
  );
  const lines: TransactionLine[] =
    Array.isArray(lineSource) && lineSource.length
      ? lineSource.map((l) => ({
          label: String(pick(l, "label", "description", "name") ?? "Item"),
          amount: Number(pick(l, "amount", "total") ?? 0),
        }))
      : [{ label: course, amount }];

  const n = pick<number>(raw, "installmentNumber");
  const total = pick<number>(raw, "totalInstallments", "installmentsCount");

  return {
    id,
    invoice: String(pick(raw, "invoiceNumber", "invoice", "reference") ?? id),
    course,
    term: pick<string>(raw, "term", "termLabel", "notes") ?? "",
    date: formatDate(dateIso),
    dateNote: status === "paid" ? formatTime(dateIso) : "Due date",
    amount,
    currency: pick<string>(raw, "currency") ?? "EGP",
    installment:
      pick<string>(raw, "installment", "installmentLabel") ??
      (n && total ? `Installment ${n} / ${total}` : "One-time payment"),
    method: pick<string>(raw, "paymentMethod", "method", "gateway") ?? "—",
    methodNote:
      pick<string>(
        raw,
        "transactionReference",
        "gatewayReference",
        "authCode",
      ) ?? "",
    status,
    lines,
  };
}

const toTransactions = (raw: unknown): Transaction[] =>
  toArray(raw).map(toTransaction);

// ---------------- Dashboard ----------------
// GET /api/learner/dashboard -> { learner, stats, recentApplications, enrollments, recentPayments }
function toDashboard(raw: unknown): LearnerDashboard {
  const dto = (raw ?? {}) as Raw;
  const stats = (pick<Raw>(dto, "stats") ?? {}) as Raw;
  const enrollments = toArray(pick(dto, "enrollments"));
  const n = (v: unknown) => Number(v ?? 0) || 0;

  const active = n(pick(stats, "activeEnrollments"));
  const completed = n(pick(stats, "completedEnrollments"));
  const totalApps = n(pick(stats, "totalApplications"));
  const pendingApps = n(pick(stats, "pendingApplications"));
  const approvedApps = n(pick(stats, "approvedApplications"));
  const paid = n(pick(stats, "totalPaid"));
  const currency = pick<string>(stats, "currency") ?? "EGP";
  const totalEnrollments = enrollments.length || active + completed;

  const metrics: ProfileMetric[] = [
    {
      id: "enrolment",
      label: "Active Enrolment",
      icon: "menu_book",
      value: `${active} ${active === 1 ? "Program" : "Programs"}`,
      caption: "Currently enrolled",
      footerLeft: `${completed} completed`,
    },
    {
      id: "progress",
      label: "Completion",
      icon: "trending_up",
      value: totalEnrollments
        ? `${Math.round((completed / totalEnrollments) * 100)}%`
        : "0%",
      caption: "Completed enrolments",
      progress: totalEnrollments
        ? Math.round((completed / totalEnrollments) * 100)
        : 0,
      footerLeft: `${completed} of ${totalEnrollments} enrolments`,
    },
    {
      id: "applications",
      label: "Applications",
      icon: "assignment",
      value: String(totalApps),
      caption: "Total submitted",
      footerLeft: `${approvedApps} approved`,
      footerRight: `${pendingApps} pending`,
    },
    {
      id: "payments",
      label: "Total Paid",
      icon: "payments",
      value: `${paid.toLocaleString("en-US")} ${currency}`,
      caption: "Successful payments",
      footerLeft: "",
    },
  ];

  const e = enrollments.find((x) =>
    ["enrolled", "active"].includes(String(pick(x, "status")).toLowerCase()),
  );
  const enrollment: EnrollmentSummary | null = e
    ? {
        status: pick<string>(e, "status") ?? "In Progress",
        degree: pick<string>(e, "programTitle", "courseTitle") ?? "—",
        accreditation: "",
        module: pick<string>(e, "courseTitle") ?? "—",
        progress: 0,
        mentor: "—",
        nextSession: "—",
        deliverable: "—",
        deliverableDue: "",
      }
    : null;

  return { metrics, enrollment };
}

export { toProfile, toCampusOptions, toTransactions, toDashboard };
