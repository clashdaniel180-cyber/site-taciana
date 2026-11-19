"use client";
export default function ConfirmButton({ children, message }: { children: React.ReactNode; message: string }) {
  return <button className="btn sm red" onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}
