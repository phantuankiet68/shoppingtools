import { prisma } from "@/lib/prisma";

import InvoiceClient from "@/components/admin/orders/InvoiceClient";

import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },

    include: {
      items: true,
    },
  });

  if (!order) {
    return notFound();
  }

  const serializedOrder = JSON.parse(JSON.stringify(order));

  return <InvoiceClient order={serializedOrder} />;
}
