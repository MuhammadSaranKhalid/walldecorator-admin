"use client";

import { useState } from "react";
import { RefreshCw, Search, ChevronDown, Package } from "lucide-react";
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
import Link from "next/link";

// Mock customization requests data
const mockRequests = [
  {
    id: "CUST-1052",
    dateSubmitted: "Oct 26, 2023",
    customerEmail: "user@email.com",
    material: "Steel",
    status: "new",
  },
  {
    id: "CUST-1051",
    dateSubmitted: "Oct 25, 2023",
    customerEmail: "another.user@email.com",
    material: "Wood",
    status: "processing",
  },
  {
    id: "CUST-1050",
    dateSubmitted: "Oct 25, 2023",
    customerEmail: "customer@email.com",
    material: "Acrylic",
    status: "completed",
  },
  {
    id: "CUST-1049",
    dateSubmitted: "Oct 24, 2023",
    customerEmail: "test@email.com",
    material: "Iron",
    status: "reviewed",
  },
  {
    id: "CUST-1048",
    dateSubmitted: "Oct 23, 2023",
    customerEmail: "example@email.com",
    material: "Steel",
    status: "rejected",
  },
];

const statusConfig = {
  new: {
    label: "New",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  },
  processing: {
    label: "Processing",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  },
};

export default function CustomizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(mockRequests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    }
  };

  const handleRefresh = () => {
    // Refresh logic would go here
    console.log("Refreshing customization requests...");
  };

  // Check if there are no requests (for empty state)
  const hasRequests = mockRequests.length > 0;

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Customization Requests
          </h1>
          <p className="text-muted-foreground text-base">
            Manage and respond to all incoming custom decor requests.
          </p>
        </div>
        <Button
          variant="outline"
          className="font-bold"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer email or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={materialFilter} onValueChange={setMaterialFilter}>
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Material: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Material: All</SelectItem>
              <SelectItem value="steel">Steel</SelectItem>
              <SelectItem value="wood">Wood</SelectItem>
              <SelectItem value="acrylic">Acrylic</SelectItem>
              <SelectItem value="iron">Iron</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Sort by: Newest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort by: Newest</SelectItem>
              <SelectItem value="oldest">Sort by: Oldest</SelectItem>
              <SelectItem value="status">Sort by: Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                      <th className="relative px-6 sm:w-12 sm:px-8" scope="col">
                        <Checkbox
                          checked={selectedRequests.length === mockRequests.length}
                          onCheckedChange={handleSelectAll}
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                        />
                      </th>
                      <th
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
                        scope="col"
                      >
                        Request ID
                      </th>
                      <th
                        className="px-3 py-3.5 text-left text-sm font-semibold"
                        scope="col"
                      >
                        Date Submitted
                      </th>
                      <th
                        className="px-3 py-3.5 text-left text-sm font-semibold"
                        scope="col"
                      >
                        Customer Email
                      </th>
                      <th
                        className="px-3 py-3.5 text-left text-sm font-semibold"
                        scope="col"
                      >
                        Material
                      </th>
                      <th
                        className="px-3 py-3.5 text-left text-sm font-semibold"
                        scope="col"
                      >
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6" scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockRequests.map((request) => {
                      const status = statusConfig[request.status as keyof typeof statusConfig];
                      return (
                        <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                          <td className="relative px-7 sm:w-12 sm:px-8">
                            <Checkbox
                              checked={selectedRequests.includes(request.id)}
                              onCheckedChange={(checked) =>
                                handleSelectRequest(request.id, checked as boolean)
                              }
                              className="absolute left-4 top-1/2 -translate-y-1/2"
                            />
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                            #{request.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                            {request.dateSubmitted}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                            {request.customerEmail}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                            {request.material}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <Badge variant="secondary" className={status.className}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              href={`/admin/customizations/${request.id}`}
                              className="text-primary hover:text-primary/80"
                            >
                              View Details
                              <span className="sr-only">, #{request.id}</span>
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
          <h3 className="mt-4 text-lg font-semibold">No new requests</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You are all caught up! New customization requests will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

