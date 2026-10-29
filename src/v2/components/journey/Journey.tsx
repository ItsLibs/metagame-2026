"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { readUtm } from "@/lib/utm";
import { FORMS } from "@/v2/forms";
import {
  answerWords,
  boxWords,
  checkForm,
  checkStep,
  isEmpty,
  isQuestion,
  visibleItems,
  visibleSteps,
  type Answer,
  type Answers,
  type Note,
  type Step,
} from "@/v2/forms/engine";
import { cn } from "@/v2/lib/utils";
import Glyph from "../Glyph";
import Mg2Die from "../nav/Mg2Die";
import { Button } from "../ui/button";
import { Field } from "./Fields";
import { DISPLAY, TOKEN } from "./look";
import Rich from "./Rich";
import ScheduleBoard, { SCHEDULE_KEYS } from "./ScheduleBoard";
import TeamBoard, { TEAM_KEYS } from "./TeamBoard";
import Track from "./Track";

type Phase =
  | { at: "cover" }
  | { at: "step"; index: number }
  | { at: "review" }
  | { at: "sending" }
  | { at: "done"; preview?: Record<string, unknown> };

const draftKey = (slug: string) => `journey:${slug}`;

// The questions a step's board asks itself, so they aren't asked twice.
const BOARD_KEYS: Record<NonNullable<Step["view"]>, readonly string[]> = {
  schedule: SCHEDULE_KEYS,
  teams: TEAM_KEYS,
};
const onBoard = (step: Step, key: string) =>
  !!step.view && BOARD_KEYS[step.view].includes(key);
const EYEBROW =
  "font-space-mono text-xs font-bold tracking-[0.14em] text-meeple uppercase";

// The tokens that pile up when you finish, in the brand's colours.
const CONFETTI = [
  "bg-meeple",
  "bg-tan",
  "bg-sky",
  "bg-moss",
  "bg-brand-blue",
  "bg-peach",
  "bg-navy",
];

// One of the site's forms as a journey (src/v2/forms): a cover, then a step
// at a time along a board of spaces, a last look at every answer, and a
// finish. Answers are kept in this browser as you go (pictures aside), so a
// refresh picks up where you left off. The finished answers go to
// /api/forms/<slug>, which writes them to the same Airtable table the old
// form did.
export default function Journey({ slug }: { slug: string }) {
  const def = FORMS[slug];
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>({ at: "cover" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [back, setBack] = useState(false);
  const [resume, setResume] = useState<number | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const steps = visibleSteps(def, answers);

  // A saved draft, read once mounted (the timer keeps setState out of the
  // effect body).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(draftKey(slug)) ?? "null",
        );
        if (saved?.answers && Object.keys(saved.answers).length) {
          setAnswers(saved.answers);
          setResume(typeof saved.step === "number" ? saved.step : 0);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, [slug]);

  // Keep the draft as they go. Pictures are too big for storage.
  const stepIndex = phase.at === "step" ? phase.index : null;
  useEffect(() => {
    if (phase.at === "done" || phase.at === "cover") return;
    const t = setTimeout(() => {
      try {
        const kept = Object.fromEntries(
          Object.entries(answers).filter(
            ([, v]) => !(v && typeof v === "object" && !Array.isArray(v)),
          ),
        );
        localStorage.setItem(
          draftKey(slug),
          JSON.stringify({ answers: kept, step: stepIndex ?? 0 }),
        );
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [answers, phase.at, stepIndex, slug]);

  const go = (next: Phase, keep: Record<string, string> = {}) => {
    const order = (p: Phase) =>
      p.at === "cover" ? -1 : p.at === "step" ? p.index : 999;
    setBack(order(next) < order(phase));
    setPhase(next);
    setErrors(keep);
    requestAnimationFrame(() => {
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      heading.current?.focus({ preventScroll: true });
    });
  };

  const set = (key: string, v: Answer) => {
    setAnswers((a) => ({ ...a, [key]: v }));
    setErrors((e) => {
      if (!e[key]) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  };
  // For the boards, which can change several answers in one drag.
  const update = (key: string, fn: (v: Answer) => Answer) =>
    setAnswers((a) => ({ ...a, [key]: fn(a[key]) }));

  const focusFirst = (e: Record<string, string>) =>
    requestAnimationFrame(() => {
      const key = Object.keys(e)[0];
      document
        .querySelector<HTMLElement>(
          `[data-field="${key}"] input, [data-field="${key}"] textarea`,
        )
        ?.focus();
    });

  const forward = () => {
    if (phase.at !== "step") return;
    const e = checkStep(steps[phase.index], answers);
    if (Object.keys(e).length) {
      setErrors(e);
      focusFirst(e);
      return;
    }
    go(
      phase.index + 1 < steps.length
        ? { at: "step", index: phase.index + 1 }
        : { at: "review" },
    );
  };

  const backward = () => {
    if (phase.at === "step")
      go(
        phase.index ? { at: "step", index: phase.index - 1 } : { at: "cover" },
      );
    else if (phase.at === "review") go({ at: "step", index: steps.length - 1 });
  };

  // Back to the first step with a problem, showing what's wrong.
  const showProblems = (e: Record<string, string>) => {
    const i = steps.findIndex((s) =>
      visibleItems(s, answers).some((it) => isQuestion(it) && e[it.key]),
    );
    go({ at: "step", index: Math.max(0, i) }, e);
    focusFirst(e);
  };

  const submit = async () => {
    const e = checkForm(def, answers);
    if (Object.keys(e).length) return showProblems(e);
    setFailure(null);
    setPhase({ at: "sending" });
    try {
      const res = await fetch(`/api/forms/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          utm: readUtm(),
          website: honeypot.current?.value ?? "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors && Object.keys(data.errors).length)
          return showProblems(data.errors);
        setFailure(data.error ?? "Something went wrong on our end.");
        setPhase({ at: "review" });
        return;
      }
      try {
        localStorage.removeItem(draftKey(slug));
      } catch {}
      go({
        at: "done",
        preview: data.stored === false ? data.preview : undefined,
      });
    } catch {
      setFailure(
        "Couldn't reach the site. Check your connection and try again.",
      );
      setPhase({ at: "review" });
    }
  };

  const startOver = () => {
    try {
      localStorage.removeItem(draftKey(slug));
    } catch {}
    setAnswers({});
    setResume(null);
    go({ at: "step", index: 0 });
  };

  const titles = steps.map((s) => s.title);
  const position =
    phase.at === "step"
      ? phase.index
      : phase.at === "cover"
        ? -1
        : steps.length;
  // Sending stays on the last look, so it doesn't replay the entrance.
  const view =
    phase.at === "step"
      ? `step-${steps[phase.index]?.key}`
      : phase.at === "sending"
        ? "review"
        : phase.at;

  return (
    <div
      ref={top}
      className="mx-auto w-full max-w-[880px] scroll-mt-6 px-4 pt-24 pb-20 sm:px-8 md:pt-28"
    >
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className={EYEBROW}>{def.eyebrow}</p>
          <h1
            className={`${DISPLAY} mt-2 text-[clamp(46px,7.5vw,88px)] leading-[0.88] text-balance text-navy`}
          >
            {def.title}
          </h1>
        </div>
        <span
          aria-hidden
          className={cn(
            TOKEN,
            "mt-1 size-14 -rotate-6 sm:size-20",
            def.token,
            phase.at === "sending" && "motion-safe:animate-spin",
          )}
          // The card-games glyph's front card fills with the token's colour.
          style={
            {
              "--glyph-bg": `var(--color-${/bg-([a-z-]+)/.exec(def.token)?.[1] ?? "navy"})`,
            } as CSSProperties
          }
        >
          <Glyph name={def.glyph} className="size-9 sm:size-12" />
        </span>
      </header>

      {(phase.at === "step" ||
        phase.at === "review" ||
        phase.at === "sending") && (
        <Track
          titles={titles}
          current={position}
          onJump={(i) =>
            go(i < steps.length ? { at: "step", index: i } : { at: "review" })
          }
        />
      )}

      <div
        key={view}
        className={cn(
          "mt-9 animate-in duration-300 fade-in",
          back ? "slide-in-from-left-4" : "slide-in-from-right-4",
        )}
      >
        {phase.at === "cover" && (
          <section aria-labelledby="journey-heading">
            <h2
              id="journey-heading"
              ref={heading}
              tabIndex={-1}
              className="sr-only"
            >
              Before you start
            </h2>
            <p className="max-w-[38em] text-lg leading-relaxed text-ink/80 sm:text-xl">
              <Rich text={def.pitch} />
            </p>
            <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-y-2 border-navy py-4">
              {[
                ...def.facts,
                { label: "Steps", value: String(steps.length) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="font-space-mono text-[10.5px] font-bold tracking-[0.14em] text-meeple uppercase">
                    {label}
                  </dt>
                  <dd
                    className={`${DISPLAY} mt-1 text-[26px] leading-none text-navy`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {def.notice && (
              <p className="mt-6 max-w-[44em] border-l-2 border-tan pl-4 text-[15px] leading-relaxed text-ink/70">
                <Rich text={def.notice} />
              </p>
            )}
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button
                onClick={() =>
                  go({
                    at: "step",
                    index:
                      resume != null ? Math.min(resume, steps.length - 1) : 0,
                  })
                }
                size="lg"
                className="group gap-3"
              >
                <Mg2Die
                  size={22}
                  className="transition-transform duration-500 group-hover:rotate-[360deg]"
                />
                {resume != null ? "Pick up where you left off" : "Let's go"}
              </Button>
              {resume != null && (
                <button
                  type="button"
                  onClick={startOver}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 underline underline-offset-4 hover:text-meeple"
                >
                  <RotateCcw aria-hidden className="size-3.5" />
                  Start over
                </button>
              )}
            </div>
          </section>
        )}

        {phase.at === "step" && steps[phase.index] && (
          <section aria-labelledby="journey-heading">
            <p className={EYEBROW}>
              Step {phase.index + 1} of {steps.length}
            </p>
            <h2
              id="journey-heading"
              ref={heading}
              tabIndex={-1}
              className={`${DISPLAY} mt-1 text-[clamp(36px,5vw,56px)] leading-[0.95] text-navy outline-none`}
            >
              {steps[phase.index].title}
            </h2>
            {steps[phase.index].intro && (
              <p className="mt-2 max-w-[40em] text-[16.5px] leading-relaxed text-ink/75">
                <Rich text={steps[phase.index].intro!} />
              </p>
            )}
            <div className="mt-8 flex flex-col gap-9">
              {steps[phase.index].view === "schedule" && (
                <ScheduleBoard answers={answers} update={update} />
              )}
              {steps[phase.index].view === "teams" && (
                <TeamBoard answers={answers} update={update} />
              )}
              {visibleItems(steps[phase.index], answers)
                .filter((item) => !onBoard(steps[phase.index], item.key))
                .map((item) =>
                  isQuestion(item) ? (
                    <Field
                      key={item.key}
                      q={item}
                      value={answers[item.key]}
                      error={errors[item.key]}
                      onChange={(v) => set(item.key, v)}
                      onEnter={forward}
                      answers={answers}
                      onExtra={set}
                    />
                  ) : (
                    <NoteBlock key={item.key} note={item} />
                  ),
                )}
            </div>
            <Footer
              onBack={backward}
              backLabel={phase.index ? "Back" : "The cover"}
              next={
                <Button onClick={forward} size="lg" className="gap-2">
                  {phase.index + 1 < steps.length ? "Next" : "Last look"}
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
              }
              hint={
                Object.keys(errors).length
                  ? "A few answers need another look."
                  : undefined
              }
            />
          </section>
        )}

        {(phase.at === "review" || phase.at === "sending") && (
          <section aria-labelledby="journey-heading">
            <p className={EYEBROW}>Last look</p>
            <h2
              id="journey-heading"
              ref={heading}
              tabIndex={-1}
              className={`${DISPLAY} mt-1 text-[clamp(36px,5vw,56px)] leading-[0.95] text-navy outline-none`}
            >
              Ready to send it?
            </h2>
            <p className="mt-2 text-[16.5px] text-ink/75">
              Here&apos;s everything you said. Change any step before it goes.
            </p>
            {steps.map((s, i) => {
              const said = visibleItems(s, answers)
                .filter(isQuestion)
                .filter((q) => !isEmpty(answers[q.key]));
              return (
                <div key={s.key} className="mt-7 border-t-2 border-navy pt-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3
                      className={`${DISPLAY} text-[26px] leading-none text-navy`}
                    >
                      {s.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => go({ at: "step", index: i })}
                      disabled={phase.at === "sending"}
                      className="font-space-mono text-[11px] font-bold tracking-[0.12em] text-meeple uppercase hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  {said.length ? (
                    <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
                      {said.map((q) => (
                        <div key={q.key} className="contents">
                          <dt className="text-[14.5px] leading-snug text-ink/60">
                            {q.label}
                          </dt>
                          <dd className="text-[15.5px] leading-snug font-medium break-words whitespace-pre-wrap text-navy">
                            {[
                              answerWords(q, answers[q.key]),
                              boxWords(q, answers),
                            ]
                              .filter(Boolean)
                              .join("\n")}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="mt-2 text-[15px] text-ink/45 italic">
                      Skipped.
                    </p>
                  )}
                </div>
              );
            })}
            {failure && (
              <p
                role="alert"
                className="mt-8 border-l-2 border-meeple pl-4 text-[15.5px] text-ink/80"
              >
                <b className="text-meeple">That didn&apos;t go through.</b>{" "}
                {failure} If it keeps happening, the{" "}
                <a
                  href={def.airtableForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy underline underline-offset-2"
                >
                  Airtable form
                </a>{" "}
                still works.
              </p>
            )}
            <Footer
              onBack={backward}
              backLabel="Back"
              disabled={phase.at === "sending"}
              next={
                <Button
                  onClick={submit}
                  size="lg"
                  disabled={phase.at === "sending"}
                  className="gap-3"
                >
                  <Mg2Die
                    size={22}
                    className={
                      phase.at === "sending" ? "motion-safe:animate-spin" : ""
                    }
                  />
                  {phase.at === "sending" ? "Sending…" : "Send it in"}
                </Button>
              }
            />
          </section>
        )}

        {phase.at === "done" && (
          <section aria-labelledby="journey-heading">
            <div aria-hidden className="flex flex-wrap gap-1.5">
              {Array.from({ length: 14 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-5 rounded-full motion-safe:animate-in motion-safe:duration-500 motion-safe:fill-mode-backwards motion-safe:zoom-in-50 motion-safe:fade-in motion-safe:slide-in-from-top-3",
                    CONFETTI[i % CONFETTI.length],
                  )}
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              ))}
            </div>
            <p className={`${EYEBROW} mt-7`}>Sent</p>
            <h2
              id="journey-heading"
              ref={heading}
              tabIndex={-1}
              className={`${DISPLAY} mt-1 text-[clamp(44px,6.5vw,76px)] leading-[0.9] text-navy outline-none`}
            >
              {def.done.title}
            </h2>
            <p className="mt-4 max-w-[38em] text-lg leading-relaxed text-ink/80">
              {def.done.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {def.done.links.map(({ label, href }, i) => (
                <Button
                  key={href}
                  asChild
                  variant={i ? "ghost" : "default"}
                  className={
                    i
                      ? "border-2 border-navy text-navy hover:border-navy hover:bg-navy/5"
                      : ""
                  }
                >
                  {href.startsWith("/") ? (
                    <Link href={href}>{label}</Link>
                  ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  )}
                </Button>
              ))}
            </div>
            {phase.preview && (
              <div className="mt-10 border-t border-navy/15 pt-4">
                <p className="font-space-mono text-[11px] font-bold tracking-[0.12em] text-ink/55 uppercase">
                  Dev only: not saved (no AIRTABLE_API_KEY). This row would go
                  to {def.tableId}:
                </p>
                <pre className="mt-2 overflow-x-auto text-[12px] leading-relaxed text-ink/70">
                  {JSON.stringify(phase.preview, null, 2)}
                </pre>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Bots fill in every field; people never see this one. */}
      <input
        ref={honeypot}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] size-px opacity-0"
      />

      {phase.at !== "done" && (
        <p className="mt-16 border-t border-navy/15 pt-4 text-[13.5px] text-ink/55">
          Prefer the old form?{" "}
          <a
            href={def.airtableForm}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-navy"
          >
            It&apos;s still on Airtable
          </a>
          , and its answers land in the same place.
        </p>
      )}
    </div>
  );
}

function Footer({
  onBack,
  backLabel,
  next,
  hint,
  disabled,
}: {
  onBack: () => void;
  backLabel: string;
  next: React.ReactNode;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-navy pt-5">
      <button
        type="button"
        onClick={onBack}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-navy hover:text-meeple disabled:opacity-40"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {backLabel}
      </button>
      <div className="flex flex-wrap items-center gap-4">
        {hint && (
          <p role="alert" className="text-sm font-semibold text-meeple">
            {hint}
          </p>
        )}
        {next}
      </div>
    </div>
  );
}

function NoteBlock({ note }: { note: Note }) {
  const win = note.tone === "win";
  return (
    <div
      role={win ? "status" : undefined}
      className={cn(
        "animate-in border-l-4 py-1 pl-5 duration-500 fade-in slide-in-from-left-2",
        win ? "border-moss" : "border-tan",
      )}
    >
      {note.title && (
        <p
          className={`${DISPLAY} text-[30px] leading-none ${win ? "text-moss" : "text-navy"}`}
        >
          {note.title}
        </p>
      )}
      <p className="mt-2 max-w-[42em] text-[15.5px] leading-relaxed text-ink/80">
        <Rich text={note.body} />
      </p>
      {note.cta && (
        <Button asChild className="mt-4">
          <a href={note.cta.href}>{note.cta.label} →</a>
        </Button>
      )}
    </div>
  );
}
