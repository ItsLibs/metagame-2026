import type { Metadata } from "next";
import { loadPosterCatalog } from "@/lib/poster-catalog";
import PosterForm from "./poster-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Make a poster | Metagame",
  robots: { index: false, follow: false },
};

export default async function PostersPage() {
  let options;
  try {
    options = (await loadPosterCatalog()).map(
      ({ value, label, available }) => ({ value, label, available }),
    );
  } catch {
    options = null;
  }
  return (
    <main className="min-h-screen bg-[#fffaf0] px-6 py-16 text-[#19345b]">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 font-mono text-sm tracking-widest uppercase">
          Metagame · November 6–8, 2026
        </p>
        <h1 className="mb-4 text-5xl font-bold">Put play on the map.</h1>
        <p className="mb-10 text-lg">
          Choose where you’ll put up your poster. Every poster for the same area
          uses the same QR code.
        </p>
        {options ? (
          <PosterForm options={options} />
        ) : (
          <p role="alert" className="rounded-xl border border-current p-6">
            The poster options are temporarily unavailable. Please try again
            shortly.
          </p>
        )}
        <p className="mt-8 text-sm">
          Print at actual size (100%). PDFs include at least ¼-inch white
          margins. Chess posters are landscape; D20 posters are portrait. The
          original artwork is preserved.
        </p>
      </div>
    </main>
  );
}
