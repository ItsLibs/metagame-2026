import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { POSTER_ORIGIN } from "@/lib/poster-options";
import { shortUrl, validateSlug } from "@/lib/tracking-links";

export type PosterDesign = "d20" | "chess";
export type PosterSize = "letter" | "13x19";
export const PRINT_MARGIN = 18;

const templates = {
  "d20-letter": {
    file: "poster_d20_lettersize.pdf",
    sha256: "34b3d3abd1fbb11856036d001dc59c4821c7f165f70906fdc6058a3a2ae3fb2d",
    width: 612,
    height: 792,
    qr: { x: 95, top: 584, size: 83 },
  },
  "d20-13x19": {
    file: "poster_d20_13x19.pdf",
    sha256: "b7c9da63b75c6c11ab31bb96a208d986ce8cf2c19a9b8f518bf061f06d184e4d",
    width: 936,
    height: 1368,
    qr: { x: 146, top: 969, size: 124 },
  },
  chess: {
    file: "poster_next_move_find_people_v2.pdf",
    sha256: "b81ee4c2d3422f665552c9aad1e7150747e72dd330f630d09fa219ee2fd88192",
    width: 792,
    height: 445.7368,
    qr: { x: 499, top: 21, size: 97 },
  },
};

export async function createPosterPdf(
  design: PosterDesign,
  size: PosterSize,
  slug: string,
): Promise<Uint8Array> {
  if (design === "chess" && size !== "letter") {
    throw new Error("Chess posters are available in Letter only");
  }
  if (validateSlug(slug)) throw new Error("Invalid poster link");
  const templateKey: keyof typeof templates =
    design === "chess" ? "chess" : `d20-${size}`;
  const template = templates[templateKey];
  const bytes = await readFile(
    path.join(process.cwd(), "assets/posters", template.file),
  );
  if (createHash("sha256").update(bytes).digest("hex") !== template.sha256) {
    throw new Error("Poster artwork changed; reverify QR placement");
  }
  const source = await PDFDocument.load(bytes);
  const page = source.getPages()[0];
  if (
    source.getPageCount() !== 1 ||
    Math.abs(page.getWidth() - template.width) > 0.01 ||
    Math.abs(page.getHeight() - template.height) > 0.01
  ) {
    throw new Error("Poster artwork geometry changed; reverify QR placement");
  }
  const qr = template.qr;
  const y = page.getHeight() - qr.top - qr.size;
  page.drawRectangle({
    x: qr.x,
    y,
    width: qr.size,
    height: qr.size,
    color: rgb(1, 1, 1),
  });
  const matrix = QRCode.create(shortUrl(POSTER_ORIGIN, slug), {
    errorCorrectionLevel: "M",
  }).modules;
  const moduleSize = qr.size / (matrix.size + 8);
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (matrix.get(row, col))
        page.drawRectangle({
          x: qr.x + (col + 4) * moduleSize,
          y: y + (matrix.size + 3 - row) * moduleSize,
          width: moduleSize,
          height: moduleSize,
          color: rgb(0, 0, 0),
        });
    }
  }
  const output = await PDFDocument.create();
  const portrait = size === "letter" ? [612, 792] : [936, 1368];
  const [width, height] =
    design === "chess" ? [...portrait].reverse() : portrait;
  const target = output.addPage([width, height]);
  const [artwork] = await output.embedPages([page]);
  const scale = Math.min(
    (width - 2 * PRINT_MARGIN) / template.width,
    (height - 2 * PRINT_MARGIN) / template.height,
  );
  target.drawPage(artwork, {
    x: (width - template.width * scale) / 2,
    y: (height - template.height * scale) / 2,
    width: template.width * scale,
    height: template.height * scale,
  });
  output.setTitle(`Metagame ${design === "d20" ? "D20" : "Chess"} poster`);
  output.setSubject(
    "Print at actual size (100%). Quarter-inch minimum margins.",
  );
  return output.save();
}
