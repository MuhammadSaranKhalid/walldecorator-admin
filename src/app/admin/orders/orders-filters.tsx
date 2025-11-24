"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    params.set('page', '1'); // Reset to first page on filter change

    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');

    startTransition(() => {
      router.push('/admin/orders');
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="search" className="text-xs font-medium mb-1.5 block text-muted-foreground">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Order Number, Customer Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full"
          onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
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
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full lg:w-48">
        <Label htmlFor="date-from" className="text-xs font-medium mb-1.5 block text-muted-foreground">
          Date From
        </Label>
        <Input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-10 w-full"
        />
      </div>

      <div className="w-full lg:w-48">
        <Label htmlFor="date-to" className="text-xs font-medium mb-1.5 block text-muted-foreground">
          Date To
        </Label>
        <Input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-10 w-full"
        />
      </div>

      <div className="flex items-end gap-2 w-full lg:w-auto">
        <Button
          onClick={handleApplyFilters}
          className="h-10 px-8 font-semibold flex-1 lg:flex-initial"
          disabled={isPending}
        >
          {isPending ? 'Applying...' : 'Apply'}
        </Button>
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="h-10 px-6 font-semibold flex-1 lg:flex-initial"
          disabled={isPending}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
