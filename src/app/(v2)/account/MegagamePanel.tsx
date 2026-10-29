"use client";

import { useActionState } from "react";
import { chooseMegagameClass, type ClassState } from "./actions";
import {
  activeClasses,
  CLASS_LABELS,
  MEGAGAME_CLASSES,
  type MegagameLevels,
} from "@/lib/megagame-levels";
import MegagameClassLevels from "@/v2/components/MegagameClassLevels";
import { Button } from "@/v2/components/ui/button";

// Placeholder until the class picker is designed: each button sets level 1 in
// its class and 0 in the others.
export default function MegagamePanel({ levels }: { levels: MegagameLevels }) {
  const [state, action, pending] = useActionState<ClassState, FormData>(
    chooseMegagameClass,
    {},
  );
  return (
    <div className="flex max-w-[960px] flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="font-grotesk text-2xl font-bold text-navy">
          Your classes
        </h2>
        <MegagameClassLevels levels={levels} />
        {activeClasses(levels).length === 0 && (
          <p className="text-base text-ink/70">
            You haven&apos;t picked a class yet.
          </p>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-grotesk text-2xl font-bold text-navy">
          Pick a class
        </h2>
        <form action={action} className="flex flex-wrap gap-3">
          {MEGAGAME_CLASSES.map((c) => (
            <Button
              key={c}
              type="submit"
              name="class"
              value={c}
              variant="navy"
              disabled={pending}
            >
              {CLASS_LABELS[c]}
            </Button>
          ))}
        </form>
        {state.error && (
          <p role="alert" className="text-sm text-meeple">
            {state.error}
          </p>
        )}
      </section>
    </div>
  );
}
