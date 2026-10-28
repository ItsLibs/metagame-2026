import { NextResponse } from "next/server";
import { attachFile, createFormRow } from "@/lib/airtable-forms";
import { pickUtm } from "@/lib/utm";
import { FORMS } from "@/v2/forms";
import {
  airtableFields,
  attachedFiles,
  checkForm,
  cleanAnswers,
  type FileAnswer,
} from "@/v2/forms/engine";

// One route for every journey: POST { answers, utm, website } to
// /api/forms/<slug>. The answers are checked against the same definition the
// page used, then written as one Airtable row (plus any attached file).
// `website` is a honeypot: people never see it, so anything there is a bot,
// and it gets a quiet "ok". Same "503 when unconfigured in prod" rule as
// /api/signup, so a misconfigured deploy doesn't fake success.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ form: string }> },
) {
  const def = FORMS[(await params).form];
  if (!def) {
    return NextResponse.json({ error: "No such form" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    body = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const answers = cleanAnswers(def, body.answers);
  const errors = checkForm(def, answers);
  if (Object.keys(errors).length) {
    return NextResponse.json(
      { error: "Some answers need another look", errors },
      { status: 400 },
    );
  }

  const fields = airtableFields(def, answers);
  if (def.utmFields) {
    const sent = (body.utm ?? {}) as Record<string, unknown>;
    const utm = pickUtm((key) => sent[key], UTM_KEYS);
    for (const key of UTM_KEYS) {
      const field = def.utmFields[key];
      if (field && utm[key]) fields[field] = utm[key];
    }
  }

  try {
    const row = await createFormRow(def.tableId, fields);
    if (!row.stored) {
      if (process.env.NODE_ENV === "production") {
        console.error(`[forms] Airtable not configured in production`);
        return NextResponse.json(
          { error: "Submissions are temporarily unavailable" },
          { status: 503 },
        );
      }
      // Local dev without a key: show what would have been written.
      return NextResponse.json({ ok: true, stored: false, preview: fields });
    }
    // The row is in; a failed upload shouldn't lose it, so it's only logged.
    let attached = true;
    for (const q of attachedFiles(def, answers)) {
      try {
        await attachFile(row.id!, q.field, answers[q.key] as FileAnswer);
      } catch (err) {
        attached = false;
        console.error(`[forms] ${def.slug}: attachment failed:`, err);
      }
    }
    return NextResponse.json({ ok: true, stored: true, attached });
  } catch (err) {
    console.error(`[forms] ${def.slug}: failed to store:`, err);
    return NextResponse.json(
      { error: "Couldn't save your answers" },
      { status: 500 },
    );
  }
}
