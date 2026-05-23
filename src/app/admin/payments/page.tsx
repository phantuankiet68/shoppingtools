import PaymentClient from "@/components/admin/payments/PaymentClient";

import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";

export default async function Page() {
  return (
    <main>
      <AdminPageTitle title="Payments Dashboard" />
      <PaymentClient />
    </main>
  );
}
