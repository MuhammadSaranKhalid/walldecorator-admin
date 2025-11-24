import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/orders";
import { OrderDetailView } from "./order-detail-view";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailView order={order} />;
}
