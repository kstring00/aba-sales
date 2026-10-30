import { Reveal } from "@/components/site/Reveal";

/** Interaction five. One handwritten line between sections. Never load-bearing. */
export function HumanMoment({ children }: { children: string }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8" aria-hidden="false">
      <Reveal as="p" className="hand max-w-[34ch] py-2 text-[1.3rem] sm:text-[1.5rem]">{children}</Reveal>
    </div>
  );
}
