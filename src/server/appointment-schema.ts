import { z } from "zod";
import { LANGS, PROCEDURE_SLUGS } from "../content/constants.ts";

export const PREFERRED_DAYS = ["any", "sat", "sun", "tue"] as const;
export const APPOINTMENT_STATUSES = ["new", "contacted", "done"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Shared by the form (client hints) and the server (the real check). Digits may be Persian or Arabic-Indic. */
export const appointmentInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z
    .string()
    .trim()
    .min(5)
    .max(40)
    .regex(/^[+\p{Nd}\s()-]+$/u),
  procedure: z.enum([...PROCEDURE_SLUGS, "other"]),
  preferredDay: z.enum(PREFERRED_DAYS),
  note: z.string().trim().max(1000).optional(),
  lang: z.enum(LANGS),
  /** Honeypot. Real visitors never see or fill it. */
  website: z.string().max(200).optional(),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
export type SubmitAppointmentResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rate_limited" | "server" };

/** A row of `appointment_requests` (migrations/0002_site.sql). */
export type AppointmentRow = {
  id: string;
  created_at: Date;
  name: string;
  phone: string;
  procedure: string;
  preferred_day: (typeof PREFERRED_DAYS)[number];
  note: string | null;
  lang: (typeof LANGS)[number];
  status: AppointmentStatus;
  email_sent: boolean;
};
