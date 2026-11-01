import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { appSecret } from "@/lib/auth/secret";
import { getSql } from "@/lib/db";
import { adminMiddleware } from "./admin-middleware";
import {
  APPOINTMENT_STATUSES,
  type AppointmentInput,
  type SubmitAppointmentResult,
} from "./appointment-schema.ts";
import {
  deleteAppointmentCore,
  listAppointmentsCore,
  setAppointmentStatusCore,
  submitAppointmentCore,
} from "./appointments-core.ts";
import { clientIp } from "./ip-hash.ts";

export { PREFERRED_DAYS, appointmentInputSchema } from "./appointment-schema.ts";
export type { AppointmentInput, AppointmentRow, SubmitAppointmentResult } from "./appointment-schema.ts";

/** Public. The handler validates itself so bad input returns `invalid` instead of throwing. */
export const submitAppointment = createServerFn({ method: "POST" })
  .inputValidator((data: AppointmentInput) => data)
  .handler(async ({ data }): Promise<SubmitAppointmentResult> => {
    const { getRequestHeaders, setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "no-store");
    try {
      const sql = await getSql();
      return await submitAppointmentCore(sql, data, { ip: clientIp(getRequestHeaders()), secret: appSecret() });
    } catch (err) {
      console.error(`[appointments] submit failed: ${err instanceof Error ? err.message : "unknown error"}`);
      return { ok: false, error: "server" };
    }
  });

/** Admin. Purges requests older than 12 months, then lists the rest newest first. */
export const listAppointments = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => listAppointmentsCore(await getSql()));

export const setAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.uuid(), status: z.enum(APPOINTMENT_STATUSES) }))
  .handler(async ({ data }) => setAppointmentStatusCore(await getSql(), data));

export const deleteAppointment = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => deleteAppointmentCore(await getSql(), data));
