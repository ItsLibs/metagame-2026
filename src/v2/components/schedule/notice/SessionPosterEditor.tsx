"use client";

import { XIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { NoteState } from "@/app/(v2)/schedule/note-actions";
import {
  bannerSize,
  isBlank,
  PAPER_HEX,
  textDoc,
  type Ink,
  type NoticeDoc,
  type Paper,
  type PenWidth,
  type TextItem,
  type TextSize,
} from "@/lib/notice-doc";
import { formatPacificTime, type PublicSession } from "@/lib/schedule";
import type { BoardNote, PosterSession } from "@/lib/unconference";
import { Dialog, DialogContent, DialogTitle } from "@/v2/components/ui/dialog";
import NoticeCanvas, { type Tool } from "./NoticeCanvas";
import NoticeToolbar from "./NoticeToolbar";
import { PosterPaper } from "./Paper";

// The schedule team's editor for a session poster: the same tools as a
// notice's poster, on a canvas the shape the poster takes on the board, and
// a choice of which session it stands for.

const minutesOf = (s: { startsAt: string; endsAt: string }) =>
  (Date.parse(s.endsAt) - Date.parse(s.startsAt)) / 60_000;

/** The poster as it starts out: the session's details, ready to rework. */
export function draftFromSession(s: PosterSession): NoticeDoc {
  const { w } = bannerSize(minutesOf(s));
  return textDoc(
    "banner",
    [
      {
        text: `${formatPacificTime(s.startsAt)}–${formatPacificTime(s.endsAt)}`,
        size: "s",
        bold: true,
      },
      { text: s.title, size: "xl", bold: true },
      ...(s.hosts.length ? [{ text: `with ${s.hosts.join(", ")}` }] : []),
      ...(s.description ? [{ text: "" }, { text: s.description }] : []),
    ],
    { x: 18, y: 18, w: w - 36 },
    "white",
  );
}

export default function SessionPosterEditor({
  note,
  sessions,
  taken,
  onSave,
  onClose,
}: {
  note: BoardNote & { session: PosterSession };
  /** The day's sessions it could stand for. */
  sessions: PublicSession[];
  /** Sessions that already have a poster, this one's own aside. */
  taken: ReadonlySet<string>;
  onSave: (input: {
    poster: NoticeDoc;
    sessionId: string;
  }) => Promise<NoteState>;
  onClose: () => void;
}) {
  const [doc, setDoc] = useState<NoticeDoc>(() =>
    note.poster.items.length > 0 ? note.poster : draftFromSession(note.session),
  );
  const docRef = useRef(doc);
  const history = useRef<NoticeDoc[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const lastKey = useRef<{ key: string; at: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [sessionId, setSessionId] = useState(note.session.id);
  const [tool, setTool] = useState<Tool>("type");
  const [ink, setInk] = useState<Ink>("ink");
  const [width, setWidth] = useState<PenWidth>(5);
  const [textSize, setTextSize] = useState<TextSize>("l");
  const [activeText, setActiveText] = useState<{
    el: HTMLElement;
    id: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const picked = sessions.find((s) => s.id === sessionId);
  const linkedPoster: PosterSession = picked
    ? {
        id: picked.id,
        slug: picked.slug,
        title: picked.title,
        description: picked.description,
        startsAt: picked.startsAt,
        endsAt: picked.endsAt,
        hosts: picked.hosts.map((h) => h.name),
      }
    : note.session;
  const size = bannerSize(minutesOf(linkedPoster));

  const commit = useCallback((next: NoticeDoc, key?: string) => {
    const now = Date.now();
    const same =
      key && lastKey.current?.key === key && now - lastKey.current.at < 1500;
    if (!same) {
      history.current.push(docRef.current);
      setCanUndo(true);
    }
    lastKey.current = key ? { key, at: now } : null;
    docRef.current = next;
    setDoc(next);
  }, []);

  function undo() {
    const prev = history.current.pop();
    if (!prev) return;
    setCanUndo(history.current.length > 0);
    lastKey.current = null;
    docRef.current = prev;
    setDoc(prev);
    setActiveText(null);
    setResetKey((k) => k + 1);
  }

  function pickTool(t: Tool) {
    if (t !== "type") {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el.isContentEditable) el.blur();
      setActiveText(null);
    }
    setTool(t);
  }

  function pickInk(i: Ink) {
    setInk(i);
    if (!activeText) return;
    const d = docRef.current;
    commit({
      ...d,
      items: d.items.map((it) =>
        it.id === activeText.id && it.kind === "text"
          ? ({ ...it, ink: i } satisfies TextItem)
          : it,
      ),
    });
  }

  // As wide as the dialog allows, up to a comfortable editing size.
  const [room, setRoom] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);
  const measure = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!el) return;
    // Measured now too: an observer only reports on a frame the page paints.
    const cs = getComputedStyle(el);
    setRoom(
      el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
    );
    const ro = new ResizeObserver(([e]) => setRoom(e.contentRect.width));
    ro.observe(el);
    observer.current = ro;
  }, []);
  const canvasW = Math.max(220, Math.min(420, room - 40));
  const paper = (doc.paper ?? "white") as Paper;

  async function save() {
    setSaving(true);
    setError(null);
    // A blank page means the design drawn from the session's details.
    const poster = isBlank(doc) ? { v: 1 as const, items: [] } : doc;
    const result = await onSave({ poster, sessionId });
    setSaving(false);
    if (result.error) setError(result.error);
    else onClose();
  }

  const choices = sessions.filter(
    (s) => s.id === note.session.id || !taken.has(s.id),
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[94dvh] max-w-[620px] overflow-y-auto border-[#1b1530]/20 bg-[#ece2cb] p-0 text-[#1b1530]"
      >
        <DialogTitle className="sr-only">Edit session poster</DialogTitle>
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 bg-[#ece2cb]/95 px-3 py-2 backdrop-blur-sm">
          <NoticeToolbar
            face="poster"
            tool={tool}
            onTool={pickTool}
            ink={ink}
            onInk={pickInk}
            width={width}
            onWidth={setWidth}
            textSize={textSize}
            onTextSize={setTextSize}
            activeText={activeText?.el.isContentEditable ? activeText.el : null}
            color="butter"
            onColor={() => {}}
            paper={paper}
            onPaper={(p) => commit({ ...docRef.current, paper: p })}
            canUndo={canUndo}
            onUndo={undo}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto flex size-8 items-center justify-center rounded-md text-[#1b1530]/55 hover:bg-[#1b1530]/10 hover:text-[#1b1530]"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div ref={measure} className="flex flex-col gap-4 px-4 pt-3 pb-5">
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Links to session
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="rounded-md border-[1.5px] border-[#1b1530]/25 bg-cream px-2 py-1.5 text-sm font-normal"
            >
              {choices.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatPacificTime(s.startsAt)}–{formatPacificTime(s.endsAt)}{" "}
                  · {s.title}
                </option>
              ))}
            </select>
            <span className="font-normal text-[#1b1530]/55">
              The poster sits at this session’s time on the board, as tall as it
              runs, and opens it when clicked.
            </span>
          </label>

          {room > 0 && (
            <div className="flex justify-center py-3">
              <PosterPaper paper={PAPER_HEX[paper]}>
                <NoticeCanvas
                  face="banner"
                  size={size}
                  doc={doc}
                  width={canvasW}
                  editing={{
                    tool,
                    ink,
                    width,
                    textSize,
                    resetKey,
                    active: true,
                    onActivate: () => {},
                    onChange: commit,
                    onFocusText: (el, id) =>
                      setActiveText(el && id ? { el, id } : null),
                  }}
                />
              </PosterPaper>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded-md border-[1.5px] border-[#1b1530] bg-[#1b1530] px-3 py-1.5 text-xs font-bold text-cream hover:bg-[#2c2350] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save poster"}
            </button>
            <button
              type="button"
              onClick={() => {
                commit(draftFromSession(linkedPoster));
                setResetKey((k) => k + 1);
              }}
              className="rounded-md border-[1.5px] border-[#1b1530]/30 bg-cream px-3 py-1.5 text-xs font-semibold hover:bg-white"
            >
              Start over from the session’s details
            </button>
            {error && (
              <span role="status" className="text-xs text-[#c02f4e]">
                {error}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
