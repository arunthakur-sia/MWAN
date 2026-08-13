import { Sidebar } from "@/components/layout/Sidebar";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex gap-3 p-3">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
