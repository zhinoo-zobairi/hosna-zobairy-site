/**
 * Pings the clinic about a new appointment request through Resend's HTTP API (no SDK).
 * The email carries no patient data: details stay in the database, where the 12-month purge reaches them.
 */

const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 5000;

let warnedMissingEnv = false;

const env = (key: string) => process.env[key]?.trim() || undefined;

/** True when Resend accepted the email. Never throws. */
export async function sendClinicEmail(): Promise<boolean> {
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
        subject: "New appointment request",
        text: emailText(),
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

function emailText(): string {
  const site = env("BETTER_AUTH_URL")?.replace(/\/+$/, "");
  const where = site ? `${site}/admin` : "the admin page of the site";
  return `A new appointment request arrived. Open ${where} to see it.`;
}
