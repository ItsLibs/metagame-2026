import type { GlyphName } from "@/v2/components/Glyph";

// A journey: one of the site's Airtable forms remade as a page that walks
// through it a step at a time. Each question writes one Airtable field,
// addressed by its field id so a renamed field keeps working; select options
// are written by name, exactly as Airtable spells them. The page (Journey)
// and the submit route (/api/forms/[form]) both run these checks, so a
// submission is validated the same way on both sides.

/** An attached file, read in the browser and sent base64-encoded. */
export type FileAnswer = {
  name: string;
  type: string;
  size: number;
  data: string;
};
export type Answer =
  | string
  | string[]
  | boolean
  | FileAnswer
  | null
  | undefined;
export type Answers = Record<string, Answer>;

export type Option = {
  /** What's written to Airtable: the select option's exact name. */
  value: string;
  /** What the page shows, when it differs from the value. */
  label?: string;
  hint?: string;
  glyph?: GlyphName;
};

type Common = {
  key: string;
  /** The Airtable field id the answer is written to. */
  field: string;
  label: string;
  /** Plain text; [words](url) becomes a link. */
  help?: string;
  required?: boolean;
  /** Asked only when this returns true. */
  show?: (a: Answers) => boolean;
};

export type Question =
  | (Common & {
      type: "text" | "email" | "phone";
      placeholder?: string;
      max?: number;
      autoComplete?: string;
    })
  | (Common & { type: "longtext"; placeholder?: string; max?: number })
  | (Common & {
      type: "number";
      min?: number;
      max?: number;
      /** Decimal places allowed (an age like 4.5); whole numbers by default. */
      decimals?: number;
      placeholder?: string;
    })
  | (Common & {
      type: "choice";
      options: Option[];
      /** Written as a one-item list, for a multiple-select field. */
      asList?: boolean;
      /** "list" shows each option on its own line with its hint. */
      layout?: "chips" | "list";
    })
  | (Common & { type: "choices"; options: Option[]; layout?: "chips" | "list" })
  | (Common & { type: "toggle"; text: string })
  | (Common & { type: "file"; accept: string[]; maxBytes: number });

/** Words on the page between questions: context, or a win to celebrate. */
export type Note = {
  type: "note";
  key: string;
  tone?: "info" | "win";
  title?: string;
  body: string;
  cta?: { label: string; href: string };
  show?: (a: Answers) => boolean;
};

export type Item = Question | Note;

export type Step = {
  key: string;
  title: string;
  intro?: string;
  items: Item[];
  show?: (a: Answers) => boolean;
};

export type FormDef = {
  /** The submit route's path segment, and the draft's storage key. */
  slug: string;
  /** Where the journey lives on the site. */
  path: string;
  tableId: string;
  /** The Airtable form this replaces, kept as a fallback link. */
  airtableForm: string;
  eyebrow: string;
  title: string;
  pitch: string;
  /** Small facts on the cover: how long it takes, when it's due. */
  facts: { label: string; value: string }[];
  /** A heads-up on the cover, e.g. a passed deadline. */
  notice?: string;
  glyph: GlyphName;
  /** The cover token's colours, as Tailwind classes. */
  token: string;
  steps: Step[];
  done: {
    title: string;
    body: string;
    links: { label: string; href: string }[];
  };
  /** Airtable field ids for the visitor's stored UTMs, when the table keeps them. */
  utmFields?: Partial<
    Record<"utm_source" | "utm_medium" | "utm_campaign", string>
  >;
};

export const isQuestion = (i: Item): i is Question => i.type !== "note";

export const visibleSteps = (def: FormDef, a: Answers) =>
  def.steps.filter((s) => !s.show || s.show(a));

export const visibleItems = (step: Step, a: Answers) =>
  step.items.filter((i) => !i.show || i.show(a));

export const visibleQuestions = (def: FormDef, a: Answers) =>
  visibleSteps(def, a).flatMap((s) => visibleItems(s, a).filter(isQuestion));

/** Every question in the form, asked or not. */
export const allQuestions = (def: FormDef) =>
  def.steps.flatMap((s) => s.items.filter(isQuestion));

export const isEmpty = (v: Answer) =>
  v == null ||
  v === false ||
  (typeof v === "string" && !v.trim()) ||
  (Array.isArray(v) && !v.length);

/** Whether a choice question has `value` picked (single or multiple). */
export const picked = (v: Answer, value: string) =>
  Array.isArray(v) ? v.includes(value) : v === value;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEXT_MAX = 300;
const LONG_MAX = 5000;

/** What's wrong with an answer, or null when it's fine. */
export function checkAnswer(q: Question, v: Answer): string | null {
  if (isEmpty(v))
    return q.required
      ? q.type === "toggle"
        ? "Tick this to go on."
        : "This one's needed."
      : null;
  switch (q.type) {
    case "text":
    case "email":
    case "phone":
    case "longtext": {
      if (typeof v !== "string") return "That doesn't look right.";
      const max = q.max ?? (q.type === "longtext" ? LONG_MAX : TEXT_MAX);
      if (v.trim().length > max) return `Keep it under ${max} characters.`;
      if (q.type === "email" && !EMAIL.test(v.trim()))
        return "That email doesn't look right.";
      if (q.type === "phone" && v.replace(/\D/g, "").length < 7)
        return "That number looks too short.";
      return null;
    }
    case "number": {
      const s = typeof v === "string" ? v.trim() : "";
      const places = q.decimals ?? 0;
      const shape = places
        ? new RegExp(`^\\d+(\\.\\d{1,${places}})?$`)
        : /^\d+$/;
      if (!shape.test(s))
        return places ? "A number, please." : "A whole number, please.";
      const n = Number(s);
      if (q.min != null && n < q.min) return `At least ${q.min}.`;
      if (q.max != null && n > q.max) return `At most ${q.max}.`;
      return null;
    }
    case "choice":
      return typeof v === "string" && q.options.some((o) => o.value === v)
        ? null
        : "Pick one of these.";
    case "choices":
      return Array.isArray(v) &&
        v.every((x) => q.options.some((o) => o.value === x))
        ? null
        : "Pick from these.";
    case "toggle":
      return typeof v === "boolean" ? null : "That doesn't look right.";
    case "file": {
      if (
        typeof v !== "object" ||
        v === null ||
        Array.isArray(v) ||
        typeof v.data !== "string" ||
        typeof v.type !== "string"
      )
        return "That file didn't come through.";
      if (!q.accept.includes(v.type)) return "That kind of file won't work.";
      // Base64 runs a third longer than the file it encodes.
      if (v.size > q.maxBytes || v.data.length > (q.maxBytes * 4) / 3 + 4)
        return "That file's too big.";
      return null;
    }
  }
}

/** Problems with the answers on one step, keyed by question. */
export function checkStep(step: Step, a: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of visibleItems(step, a).filter(isQuestion)) {
    const e = checkAnswer(q, a[q.key]);
    if (e) errors[q.key] = e;
  }
  return errors;
}

/** Problems with every question the answers make visible. */
export function checkForm(def: FormDef, a: Answers): Record<string, string> {
  return Object.assign({}, ...visibleSteps(def, a).map((s) => checkStep(s, a)));
}

/**
 * The Airtable row for a set of answers: field id → value, for the questions
 * those answers make visible. Files aren't included; they're uploaded to the
 * row once it exists.
 */
export function airtableFields(
  def: FormDef,
  a: Answers,
): Record<string, string | number | boolean | string[]> {
  const fields: Record<string, string | number | boolean | string[]> = {};
  for (const q of visibleQuestions(def, a)) {
    const v = a[q.key];
    if (isEmpty(v) || q.type === "file") continue;
    if (q.type === "number") fields[q.field] = Number(String(v).trim());
    else if (q.type === "toggle") fields[q.field] = true;
    else if (q.type === "choices") fields[q.field] = v as string[];
    else if (q.type === "choice" && q.asList) fields[q.field] = [v as string];
    else fields[q.field] = String(v).trim();
  }
  return fields;
}

/** The file questions, among those asked, that have a file attached. */
export const attachedFiles = (def: FormDef, a: Answers) =>
  visibleQuestions(def, a).filter(
    (q) => q.type === "file" && !isEmpty(a[q.key]),
  );

/**
 * Keep only answers of a shape some question could hold, for the questions
 * this form has. The route runs it on whatever the browser sent.
 */
export function cleanAnswers(def: FormDef, raw: unknown): Answers {
  const answers: Answers = {};
  if (!raw || typeof raw !== "object") return answers;
  const input = raw as Record<string, unknown>;
  for (const q of allQuestions(def)) {
    const v = input[q.key];
    if (typeof v === "string" || typeof v === "boolean") answers[q.key] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === "string"))
      answers[q.key] = v;
    else if (
      q.type === "file" &&
      v &&
      typeof v === "object" &&
      typeof (v as FileAnswer).data === "string"
    ) {
      const f = v as FileAnswer;
      answers[q.key] = {
        name: String(f.name ?? "upload").slice(0, 120),
        type: String(f.type ?? ""),
        size: Number(f.size) || 0,
        data: f.data,
      };
    }
  }
  return answers;
}
