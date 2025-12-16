import { Suspense } from "react";
import DemoClient from "./DemoClient";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-neutral-400">Loading...</div>}>
        <DemoClient />
      </Suspense>
    </main>
  );
}