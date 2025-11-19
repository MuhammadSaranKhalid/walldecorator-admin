"use client";

import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Total Revenue",
    value: "$124,560",
    change: "+5.2%",
    trend: "up",
  },
  {
    title: "Sales this Month",
    value: "$15,230",
    change: "+8.1%",
    trend: "up",
  },
  {
    title: "New Orders",
    value: "82",
    change: "-1.5%",
    trend: "down",
  },
  {
    title: "Pending Customizations",
    value: "15",
    change: "+10%",
    trend: "up",
  },
];

const recentOrders = [
  {
    id: "#3058",
    customer: "John Doe",
    date: "2023-10-27",
    total: "$149.99",
    status: "Shipped",
    statusColor: "default",
  },
  {
    id: "#3057",
    customer: "Jane Smith",
    date: "2023-10-26",
    total: "$89.50",
    status: "Processing",
    statusColor: "secondary",
  },
  {
    id: "#3056",
    customer: "Mike Johnson",
    date: "2023-10-26",
    total: "$250.00",
    status: "Pending",
    statusColor: "outline",
  },
  {
    id: "#3055",
    customer: "Emily White",
    date: "2023-10-25",
    total: "$112.20",
    status: "Delivered",
    statusColor: "default",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      {/* Page Header */}
      <header className="flex flex-wrap justify-between gap-3 items-center mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-base">
            Here's a summary of your store's performance.
          </p>
        </div>
        <Button className="font-bold">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p
                className={`text-sm font-medium mt-1 flex items-center gap-1 ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Sales Chart */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Sales Trends
              </CardTitle>
              <div className="flex items-end gap-3">
                <p className="text-[32px] font-bold">$15,230</p>
                <p className="text-green-600 text-base font-medium pb-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +8.1% this month
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[220px] flex-1 flex-col">
              <svg
                fill="none"
                height="100%"
                preserveAspectRatio="none"
                viewBox="-3 0 478 150"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                  fill="url(#paint0_linear)"
                />
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="hsl(var(--primary))"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <defs>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint0_linear"
                    x1="236"
                    x2="236"
                    y1="1"
                    y2="149"
                  >
                    <stop stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                    <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Orders Table */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-3 pt-5">
          Recent Orders
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <Badge variant={order.statusColor as any}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button className="text-primary hover:underline font-medium">
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
    </div>
  );
}

