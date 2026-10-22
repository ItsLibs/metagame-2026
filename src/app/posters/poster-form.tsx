"use client";

import { useState, type FormEvent } from "react";
import type { PosterOption } from "@/lib/poster-options";

export default function PosterForm({ options }: { options: PosterOption[] }) {
  const [area, setArea] = useState("");
  const [design, setDesign] = useState("d20");
  const [size, setSize] = useState("letter");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = options.find((option) => option.value === area);
  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(
        `/api/posters?${new URLSearchParams({ area, design, size })}`,
      );
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? "This area’s poster link is not ready yet. Please choose another area or try again later."
            : "We couldn’t create your poster. Please try again shortly.",
        );
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `metagame-${design}-${size}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }
  const inputClass =
    "mt-2 w-full rounded-lg border border-[#19345b]/30 bg-white p-3 text-base";
  return (
    <form
      onSubmit={download}
      className="space-y-6 rounded-2xl border border-[#19345b]/20 bg-white/60 p-6 sm:p-8"
    >
      <label className="block font-semibold">
        Poster area
        <select
          aria-label="Poster area"
          required
          className={inputClass}
          value={area}
          onChange={(event) => setArea(event.target.value)}
        >
          <option value="" disabled>
            Choose an area
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.available ? "" : " — coming soon"}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm">
        Choose Generic poster if you don’t have a specific area.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block font-semibold">
          Design
          <select
            aria-label="Design"
            className={inputClass}
            value={design}
            onChange={(event) => {
              setDesign(event.target.value);
              if (event.target.value === "chess") setSize("letter");
            }}
          >
            <option value="d20">D20 dice</option>
            <option value="chess">Chess · Make your next move</option>
          </select>
        </label>
        <label className="block font-semibold">
          Paper size
          <select
            aria-label="Paper size"
            className={inputClass}
            value={size}
            onChange={(event) => setSize(event.target.value)}
          >
            <option value="letter">US Letter · 8.5 × 11 in</option>
            {design === "d20" && <option value="13x19">13 × 19 in</option>}
          </select>
        </label>
      </div>
      {selected && !selected.available && (
        <p role="status">
          This area’s poster link is coming soon. Please choose another area.
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-800">
          {error}
        </p>
      )}
      <button
        disabled={!selected?.available || busy}
        className="w-full rounded-lg bg-[#19345b] px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Preparing your PDF…" : "Download print-ready PDF"}
      </button>
      <p className="text-sm" aria-live="polite">
        {selected?.available
          ? `${selected.label} · ${design === "d20" ? "Portrait" : "Landscape"} · ${size === "letter" ? "US Letter" : "13 × 19 inches"}`
          : "Select an available area to download."}
      </p>
    </form>
  );
}
