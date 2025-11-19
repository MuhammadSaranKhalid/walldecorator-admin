"use client";

import { useState } from "react";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock orders data
const mockOrders = [
  {
    id: "ORD-10543",
    customer: {
      name: "Liam Johnson",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    },
    date: "Oct 24, 2023",
    amount: 189.99,
    status: "processing",
  },
  {
    id: "ORD-10542",
    customer: {
      name: "Olivia Smith",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    },
    date: "Oct 23, 2023",
    amount: 45.50,
    status: "delivered",
  },
  {
    id: "ORD-10541",
    customer: {
      name: "Noah Williams",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    },
    date: "Oct 22, 2023",
    amount: 320.00,
    status: "shipped",
  },
  {
    id: "ORD-10540",
    customer: {
      name: "Emma Brown",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    },
    date: "Oct 21, 2023",
    amount: 75.25,
    status: "pending",
  },
  {
    id: "ORD-10539",
    customer: {
      name: "James Jones",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    },
    date: "Oct 20, 2023",
    amount: 99.00,
    status: "cancelled",
  },
];

const statusConfig = {
  processing: {
    label: "Processing",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    variant: "default" as const,
    className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  shipped: {
    label: "Shipped",
    variant: "default" as const,
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    dotColor: "bg-purple-500",
  },
  pending: {
    label: "Pending",
    variant: "default" as const,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    dotColor: "bg-yellow-500",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    dotColor: "bg-red-500",
  },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(2);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(mockOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleApplyFilters = () => {
    // Filter logic would go here
    console.log("Applying filters:", { searchQuery, statusFilter, dateFilter });
  };

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
        <Button className="font-bold w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="search" className="text-xs font-medium mb-1.5 block text-muted-foreground">
            Search
          </Label>
          <Input
            id="search"
            placeholder="Order ID, Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full"
          />
        </div>

        <div className="w-full lg:w-48">
          <Label htmlFor="status" className="text-xs font-medium mb-1.5 block text-muted-foreground">
            Status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status" className="h-10 w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-64">
          <Label htmlFor="date-range" className="text-xs font-medium mb-1.5 block text-muted-foreground">
            Date Range
          </Label>
          <Input
            id="date-range"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 w-full"
            placeholder="mm/dd/yyyy"
          />
        </div>

        <div className="flex items-end w-full lg:w-auto">
          <Button
            onClick={handleApplyFilters}
            className="h-10 px-8 font-semibold w-full lg:w-auto"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === mockOrders.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig];
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOrder(order.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                          <AvatarFallback>
                            {order.customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{order.customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>${order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={status.className}>
                        <span className={`w-2 h-2 mr-1.5 ${status.dotColor} rounded-full inline-block`}></span>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center text-sm border-t">
          <div className="text-muted-foreground mb-4 md:mb-0">
            Showing <span className="font-semibold text-foreground">1-5</span> of{" "}
            <span className="font-semibold text-foreground">120</span> orders
          </div>
          <nav className="inline-flex items-center -space-x-px">
            <Button
              variant="outline"
              size="sm"
              className="rounded-r-none"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              className="rounded-none"
              onClick={() => setCurrentPage(1)}
            >
              1
            </Button>
            <Button
              variant={currentPage === 2 ? "default" : "outline"}
              size="sm"
              className="rounded-none"
              onClick={() => setCurrentPage(2)}
            >
              2
            </Button>
            <Button
              variant={currentPage === 3 ? "default" : "outline"}
              size="sm"
              className="rounded-none"
              onClick={() => setCurrentPage(3)}
            >
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-l-none"
              onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
            >
              Next
            </Button>
          </nav>
        </div>
      </Card>
    </div>
  );
}
