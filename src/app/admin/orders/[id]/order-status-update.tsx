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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Order, OrderStatus } from "@/types/orders";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updateTrackingNumber } from "@/lib/queries/orders";
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
  const [adminNote, setAdminNote] = useState(order.admin_note || '');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (status === order.status && adminNote === (order.admin_note || '')) {
      toast.info("Please make changes before updating.");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedOrder = await updateOrderStatus(order.id, status, adminNote);
      if (updatedOrder) {
        onUpdate(updatedOrder);
        toast.success("Order status has been updated successfully.");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (trackingNumber === (order.tracking_number || '')) {
      toast.info("Please enter a different tracking number.");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedOrder = await updateTrackingNumber(order.id, trackingNumber);
      if (updatedOrder) {
        onUpdate(updatedOrder);
        toast.success("Tracking number has been updated successfully.");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update tracking number. Please try again.");
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
          <Label htmlFor="admin-note">Admin Note</Label>
          <Textarea
            id="admin-note"
            placeholder="Add a note about this order..."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpdateStatus}
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking Number</Label>
            <Input
              id="tracking"
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <Button
            onClick={handleUpdateTracking}
            disabled={isUpdating}
            variant="outline"
            className="w-full mt-2"
          >
            {isUpdating ? 'Updating...' : 'Update Tracking'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
