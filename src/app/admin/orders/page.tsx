import { Suspense } from "react";
import { OrdersTable } from "./orders-table";
import { OrdersFilters } from "./orders-filters";
import { getOrders } from "@/lib/queries/orders";
import { OrderStatus } from "@/types/orders";

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: OrderStatus | 'all';
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 10;

  const filters = {
    search: params.search,
    status: params.status || 'all',
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const { orders, total, totalPages } = await getOrders(filters, page, limit);

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage, filter, and track all customer orders.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <OrdersFilters />
      </Suspense>

      {/* Orders Table */}
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersTable
          orders={orders}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}
