"use client";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export default function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn gold" style={{ marginTop: 14 }} disabled={pending}>
      {pending ? "Salvando..." : children}
    </button>
  );
}
