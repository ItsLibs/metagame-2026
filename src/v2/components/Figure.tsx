import Image, { type StaticImageData } from "next/image";
import type { Hat } from "@/v2/hat-trick/hats";
import HatImage from "@/v2/hat-trick/HatImage";

// A photo straight on the page over a short mono caption. Photos with Hat
// Trick hats keep them (the 4:3 crop matches every hat photo, so no hat is
// cut off).
export default function Figure({
  caption,
  src,
  alt,
  hats,
  sizes = "(min-width: 1024px) 560px, 100vw",
  className = "",
}: {
  caption: React.ReactNode;
  src: StaticImageData;
  alt: string;
  hats?: Hat[];
  sizes?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      {hats?.length ? (
        <HatImage
          src={src}
          alt={alt}
          hats={hats}
          className="aspect-[4/3] w-full rounded-md"
          sizes={sizes}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          className="aspect-[4/3] w-full rounded-md object-cover"
          sizes={sizes}
        />
      )}
      <figcaption className="mt-2.5 font-space-mono text-xs leading-[1.45] text-ink/60">
        {caption}
      </figcaption>
    </figure>
  );
}
