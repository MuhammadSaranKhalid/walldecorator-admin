"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Order, OrderStatus } from "@/types/orders";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "../actions";
import { toast } from "sonner";

interface OrderStatusUpdateProps {
  order: Order;
  onUpdate: (order: Order) => void;
}

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export function OrderStatusUpdate({ order, onUpdate }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    const statusChanged = status !== order.status;
    const notesChanged = notes !== (order.notes || '');

    if (!statusChanged && !notesChanged) {
      toast.info("No changes to save.");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateOrderStatusAction(order.id, status, notes || undefined);
      if (result.success && result.order) {
        onUpdate(result.order);
        toast.success("Order updated successfully.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update order. Please try again.");
      }
    } catch {
      toast.error("Failed to update order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Order Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add an internal note about this order..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpdateStatus}
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
