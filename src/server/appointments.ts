import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LANGS, PROCEDURE_SLUGS } from "../content/constants.ts";

export const PREFERRED_DAYS = ["any", "sat", "sun", "tue"] as const;

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

/** Public. The handler validates itself so bad input returns `invalid` instead of throwing. Stub: always `server`. */
export const submitAppointment = createServerFn({ method: "POST" })
  .inputValidator((data: AppointmentInput) => data)
  .handler(async (): Promise<SubmitAppointmentResult> => ({ ok: false, error: "server" }));
