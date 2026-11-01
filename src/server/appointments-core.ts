/** Appointment logic without framework imports, so `node --test` can run it against PGlite. */
import type { Sql } from "../lib/db.ts";
import {
  appointmentInputSchema,
  type AppointmentRow,
  type AppointmentStatus,
  type SubmitAppointmentResult,
} from "./appointment-schema.ts";
import { sendClinicEmail } from "./email.ts";
import { hashIp, ipBucket } from "./ip-hash.ts";
import { checkAndRecord } from "./rate-limit.ts";

/** Approved: 5 requests per hour per IP. */
const FORM_LIMIT = { max: 5, windowSeconds: 3600 };

/** Persian (۰–۹) and Arabic-Indic (٠–٩) digits to ASCII. */
export function toAsciiDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
  });
}

function honeypotFilled(input: unknown): boolean {
  const website = (input as { website?: unknown } | null)?.website;
  return typeof website === "string" && website.trim() !== "";
}

export async function submitAppointmentCore(
  sql: Sql,
  input: unknown,
  { ip, secret }: { ip: string; secret: string },
): Promise<SubmitAppointmentResult> {
  // Bots get a success and nothing is stored.
  if (honeypotFilled(input)) return { ok: true };
  const parsed = appointmentInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, phone, procedure, preferredDay, note, lang } = parsed.data;

  let row: AppointmentRow;
  try {
    if (!(await checkAndRecord(sql, `appt:${hashIp(ipBucket(ip), secret)}`, FORM_LIMIT))) {
      return { ok: false, error: "rate_limited" };
    }
    [row] = await sql<AppointmentRow>`
      insert into appointment_requests (name, phone, procedure, preferred_day, note, lang)
      values (${name}, ${toAsciiDigits(phone)}, ${procedure}, ${preferredDay}, ${note || null}, ${lang})
      returning *`;
  } catch (err) {
    // The message only: never the input or the driver's row detail.
    console.error(`[appointments] submit failed: ${err instanceof Error ? err.message : "unknown error"}`);
    return { ok: false, error: "server" };
  }

  // The request is saved. A failed email leaves email_sent = false for the admin to see.
  try {
    if (await sendClinicEmail()) {
      await sql`update appointment_requests set email_sent = true where id = ${row.id}`;
    }
  } catch (err) {
    console.error(`[appointments] marking request ${row.id} as emailed failed: ${err instanceof Error ? err.message : "unknown error"}`);
  }
  return { ok: true };
}

/** Runs the 12-month retention purge, then returns every request, newest first. */
export async function listAppointmentsCore(sql: Sql): Promise<AppointmentRow[]> {
  await sql`delete from appointment_requests where created_at < now() - interval '12 months'`;
  return sql<AppointmentRow>`select * from appointment_requests order by created_at desc`;
}

export async function setAppointmentStatusCore(
  sql: Sql,
  { id, status }: { id: string; status: AppointmentStatus },
): Promise<{ ok: boolean }> {
  const rows = await sql`update appointment_requests set status = ${status} where id = ${id} returning id`;
  return { ok: rows.length === 1 };
}

export async function deleteAppointmentCore(sql: Sql, { id }: { id: string }): Promise<{ ok: boolean }> {
  const rows = await sql`delete from appointment_requests where id = ${id} returning id`;
  return { ok: rows.length === 1 };
}
