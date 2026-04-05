// app/admin/layout.tsx
import { AdminTitleProvider } from "@/components/admin/AdminTitleContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminTitleProvider>
      {children}
    </AdminTitleProvider>
  );
}