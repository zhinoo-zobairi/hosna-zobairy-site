import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { Lang } from "@/content/constants";
import type { Copy } from "@/content/schema";
import { appointmentInputSchema, submitAppointment } from "@/server/appointments";
import { sans } from "./type";

type Status = "idle" | "sending" | "success" | "invalid" | "rateLimited" | "error";

export function AppointmentForm({ text, lang }: { text: Copy; lang: Lang }) {
  const form = text.form;
  const ku = lang === "ku";
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) ?? "");

    const parsed = appointmentInputSchema.safeParse({
      name: value("name"),
      phone: value("phone"),
      procedure: value("procedure"),
      preferredDay: value("preferredDay"),
      note: value("note") || undefined,
      lang,
      website: value("contact_ref"),
    });
    if (!parsed.success) {
      setStatus("invalid");
      return;
    }

    setStatus("sending");
    try {
      const result = await submitAppointment({ data: parsed.data });
      if (result.ok) setStatus("success");
      else if (result.error === "invalid") setStatus("invalid");
      else if (result.error === "rate_limited") setStatus("rateLimited");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className={`mt-6 max-w-xl text-lg leading-relaxed text-ink ${sans(ku)}`}>
        {form.success}
      </p>
    );
  }

  const problem =
    status === "invalid" ? form.invalid : status === "rateLimited" ? form.rateLimited : status === "error" ? form.error : null;
  const control = `block min-h-11 w-full border border-line bg-transparent px-3 py-2 text-base text-ink focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink ${sans(ku)}`;

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl" aria-describedby={`${id}-consent`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-name`} label={form.name} ku={ku}>
          <input id={`${id}-name`} name="name" required maxLength={120} autoComplete="name" className={control} />
        </Field>
        <Field id={`${id}-phone`} label={form.phone} ku={ku}>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            required
            maxLength={40}
            autoComplete="tel"
            dir="ltr"
            className={`${control} ${ku ? "text-right" : ""}`}
          />
        </Field>
        <Field id={`${id}-procedure`} label={form.procedure} ku={ku}>
          <Select id={`${id}-procedure`} name="procedure" defaultValue="" className={control}>
            <option value="" disabled>
              —
            </option>
            {text.items.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
            <option value="other">{form.procedureOther}</option>
          </Select>
        </Field>
        <Field id={`${id}-day`} label={form.day} ku={ku}>
          <Select id={`${id}-day`} name="preferredDay" defaultValue="any" className={control}>
            <option value="any">{form.dayAny}</option>
            <option value="sat">{form.daySat}</option>
            <option value="sun">{form.daySun}</option>
            <option value="tue">{form.dayTue}</option>
          </Select>
        </Field>
        <Field id={`${id}-note`} label={form.note} ku={ku} wide>
          <textarea id={`${id}-note`} name="note" rows={3} maxLength={1000} className={`${control} resize-y`} />
        </Field>
      </div>

      {/* Honeypot: hidden from people and assistive tech, still filled in by naive bots. */}
      <input name="contact_ref" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

      <button
        type="submit"
        disabled={status === "sending"}
        className={`mt-8 inline-flex min-h-11 items-center bg-ink px-6 text-xs font-medium text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60 ${
          ku ? "font-arabic-sans text-sm" : "font-sans uppercase tracking-kicker"
        }`}
      >
        {status === "sending" ? form.sending : form.submit}
      </button>

      {problem ? (
        <p role="alert" className={`mt-4 text-sm text-ink ${sans(ku)}`}>
          {problem}
        </p>
      ) : null}

      <p id={`${id}-consent`} className={`mt-6 text-sm leading-relaxed text-muted ${sans(ku)}`}>
        {form.consent}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  ku,
  wide,
  children,
}: {
  id: string;
  label: string;
  ku: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className={`mb-2 block text-sm text-muted ${sans(ku)}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  id,
  name,
  defaultValue,
  className,
  children,
}: {
  id: string;
  name: string;
  defaultValue: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select id={id} name={name} required defaultValue={defaultValue} className={`${className} appearance-none pe-10`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}
