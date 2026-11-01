import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { defaultContent } from "@/content/default";
import {
  deleteAppointment,
  listAppointments,
  setAppointmentStatus,
  type AppointmentRow,
} from "@/server/appointments";
import { buttonClass, formatDate } from "./-ui";

export const Route = createFileRoute("/admin/")({
  loader: () => listAppointments(),
  component: Requests,
});

const STATUSES = ["new", "contacted", "done"] as const;
const DAYS: Record<AppointmentRow["preferred_day"], string> = {
  any: "Any",
  sat: "Saturday",
  sun: "Sunday",
  tue: "Tuesday",
};

function procedureName(slug: string): string {
  return defaultContent.en.items.find((item) => item.slug === slug)?.title ?? "Other";
}

function Requests() {
  const requests = Route.useLoaderData();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    setError("");
    try {
      await action();
      await router.invalidate();
    } catch {
      setError("That did not work. Reload the page and try again.");
    } finally {
      setBusyId(null);
    }
  }

  function remove(row: AppointmentRow) {
    if (!window.confirm(`Delete the request from ${row.name}? This cannot be undone.`)) return;
    void run(row.id, () => deleteAppointment({ data: { id: row.id } }));
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Appointment requests</h1>
      <p className="mt-2 text-sm text-muted">
        Newest first. Times are Iran time. Requests are deleted 12 months after they arrive.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {requests.length === 0 ? (
        <p className="mt-10 text-muted">No requests yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <tr>
                {["Received", "Name", "Phone", "Procedure", "Day", "Note", "Lang", "Status", "Email sent", ""].map(
                  (heading) => (
                    <th key={heading} className="px-3 py-2 font-medium">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {requests.map((row) => (
                <tr key={row.id} className="border-b border-line align-top last:border-0">
                  <td className="px-3 py-3 whitespace-nowrap">{formatDate(row.created_at)}</td>
                  <td className="px-3 py-3">{row.name}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <a href={`tel:${row.phone.replace(/[\s()-]/g, "")}`} className="underline underline-offset-4">
                      {row.phone}
                    </a>
                  </td>
                  <td className="px-3 py-3">{procedureName(row.procedure)}</td>
                  <td className="px-3 py-3">{DAYS[row.preferred_day]}</td>
                  <td className="max-w-xs px-3 py-3 whitespace-pre-wrap">{row.note || "—"}</td>
                  <td className="px-3 py-3 uppercase">{row.lang}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={busyId === row.id}
                          aria-pressed={row.status === status}
                          onClick={() => run(row.id, () => setAppointmentStatus({ data: { id: row.id, status } }))}
                          className={`rounded border px-2 py-1 text-xs capitalize disabled:opacity-50 ${
                            row.status === status ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className={`px-3 py-3 ${row.email_sent ? "" : "text-red-700"}`}>
                    {row.email_sent ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => remove(row)}
                      className={buttonClass}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
