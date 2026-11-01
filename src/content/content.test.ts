import assert from "node:assert/strict";
import { test } from "node:test";
import { PROCEDURE_SLUGS } from "./constants.ts";
import { defaultContent } from "./default.ts";
import { siteContentSchema } from "./schema.ts";

test("the bundled default content passes the schema", () => {
  assert.doesNotThrow(() => siteContentSchema.parse(defaultContent));
});

test("both languages list the 7 procedures in slug order", () => {
  for (const lang of ["en", "ku"] as const) {
    assert.deepEqual(
      defaultContent[lang].items.map((item) => item.slug),
      [...PROCEDURE_SLUGS],
    );
  }
});

test("a copy missing a form label is rejected", () => {
  const broken = structuredClone(defaultContent) as { en: { form: Record<string, unknown> } };
  delete broken.en.form.submit;
  assert.equal(siteContentSchema.safeParse(broken).success, false);
});

test("procedures in the wrong order are rejected", () => {
  const swapped = structuredClone(defaultContent);
  swapped.en.items.reverse();
  assert.equal(siteContentSchema.safeParse(swapped).success, false);
});

test("the default text says Sna, never Sanandaj", () => {
  assert.equal(JSON.stringify(defaultContent).includes("Sanandaj"), false);
});
