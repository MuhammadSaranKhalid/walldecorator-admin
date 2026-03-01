import prisma from "@/lib/prisma";
import { Search, Package, MapPin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { ReactNode } from "react";

// For revalidating path and fetching fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  },
  reviewing: {
    label: "Reviewing",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  },
  quoted: {
    label: "Quoted",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  },
  approved: {
    label: "Approved",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
  },
  in_production: {
    label: "In Production",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  },
  shipped: {
    label: "Shipped",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  },
};

export default async function CustomOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";

  // Fetch from database
  const customOrders = await prisma.custom_orders.findMany({
    where: {
      OR: [
        { customer_email: { contains: query, mode: "insensitive" } },
        { customer_name: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { created_at: "desc" },
    take: 50, // simple pagination for now
  });

  const hasRequests = customOrders.length > 0;

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Custom Orders
          </h1>
          <p className="text-muted-foreground text-base">
            Review customer photos and quote prices for custom wall art.
          </p>
        </div>
      </div>

      {/* Filters & Search - simple form that submits to current page */}
      <div className="mt-8">
        <form method="GET" action="/admin/customizations" className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-[400px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="query"
              defaultValue={query}
              placeholder="Search email or name..."
              className="pl-10 h-10"
            />
          </div>
        </form>
      </div>

      {/* Table */}
      {hasRequests ? (
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Card className="overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6" scope="col">
                        Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold" scope="col">
                        Customer
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold" scope="col">
                        Preferences
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold" scope="col">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6" scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customOrders.map((order) => {
                      const status = statusConfig[order.status] || {
                        label: order.status,
                        className: "bg-gray-100 text-gray-800",
                      };

                      return (
                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="font-medium text-foreground">{order.customer_name}</div>
                            <div className="text-muted-foreground">{order.customer_email}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                            {order.preferred_material ? (
                              <Badge variant="outline" className="capitalize">
                                {order.preferred_material}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <Badge variant="secondary" className={status.className}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              href={`/admin/customizations/${order.id}`}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="mt-8 text-center py-12">
          <div className="flex justify-center">
            <Package className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No custom orders found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {query
              ? "No orders match your search criteria."
              : "You are all caught up! New requests will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}
