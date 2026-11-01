/** Notifies the clinic of a new appointment request through Resend's HTTP API (no SDK). */

const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 5000;

export type ClinicEmailRequest = {
  id: string;
  created_at: Date | string;
  name: string;
  phone: string;
  procedure: string;
  preferred_day: string;
  note: string | null;
  lang: string;
};

let warnedMissingEnv = false;

const env = (key: string) => process.env[key]?.trim() || undefined;

/** True when Resend accepted the email. Never throws and never logs patient data. */
export async function sendClinicEmail(row: ClinicEmailRequest): Promise<boolean> {
  const apiKey = env("RESEND_API_KEY");
  const from = env("MAIL_FROM");
  const to = env("CLINIC_EMAIL");
  if (!apiKey || !from || !to) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true;
      console.warn("[email] RESEND_API_KEY, MAIL_FROM or CLINIC_EMAIL is not set; clinic emails are off.");
    }
    return false;
  }
  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `New appointment request — ${row.name.replace(/\s+/g, " ")}`,
        text: emailText(row),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`[email] Resend answered ${response.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] Resend request failed: ${err instanceof Error ? err.name : "unknown error"}`);
    return false;
  }
}

function emailText(row: ClinicEmailRequest): string {
  const received = row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at;
  return [
    "New appointment request",
    "",
    `Name: ${row.name}`,
    `Phone: ${row.phone}`,
    `Procedure: ${row.procedure}`,
    `Preferred day: ${row.preferred_day}`,
    `Note: ${row.note || "-"}`,
    `Language: ${row.lang}`,
    `Received: ${received}`,
    `Request id: ${row.id}`,
  ].join("\n");
}
