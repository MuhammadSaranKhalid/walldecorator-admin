import { AdminSidebar } from "@/components/admin/admin-sidebar";
// import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto bg-background">
        {children}
      </main>
      {/* <Toaster position="top-right" richColors /> */}
    </div>
  );
}

