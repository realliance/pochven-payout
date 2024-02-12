import { Spinner } from "flowbite-react";
import { RevealText } from "./RevealText";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen">
      <RevealText
        text="Loading"
        initialDelay={1000}
        interval={500}
        className="text-6xl"
      />
      <Spinner size="xl" />
    </div>
  );
}
