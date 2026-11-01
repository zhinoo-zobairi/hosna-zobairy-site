/** Shared bits for the admin pages. The `-` prefix keeps this file out of the route tree. */

export const inputClass =
  "w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none";
export const buttonClass =
  "rounded border border-ink px-3 py-1.5 text-sm hover:bg-ink hover:text-paper disabled:opacity-50";
export const primaryButtonClass =
  "rounded border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/85 disabled:opacity-50";

// One fixed zone, so the server render and the browser agree. The clinic is in Iran.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

export function formatDate(value: Date | string): string {
  return dateFormat.format(new Date(value));
}
