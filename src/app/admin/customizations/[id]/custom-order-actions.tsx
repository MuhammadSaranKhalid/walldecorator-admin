"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateCustomOrderStatus, quoteCustomOrderPrice } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CustomOrderActions({
    order,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: any;
}) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState(order.status);

    const [quotePrice, setQuotePrice] = useState(order.quoted_price?.toString() || "");
    const [adminNotes, setAdminNotes] = useState(order.admin_notes || "");

    const handleUpdateStatus = async () => {
        setIsUpdating(true);
        const result = await updateCustomOrderStatus(order.id, status);

        if (result.success) {
            toast.success("Status updated successfully");
        } else {
            toast.error(result.error);
        }
        setIsUpdating(false);
    };

    const handleQuotePrice = async () => {
        setIsUpdating(true);
        const parsedPrice = parseFloat(quotePrice);

        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            toast.error("Please enter a valid price");
            setIsUpdating(false);
            return;
        }

        const result = await quoteCustomOrderPrice(order.id, parsedPrice, adminNotes);

        if (result.success) {
            toast.success("Quote saved successfully");
            setStatus("quoted"); // sync local state
        } else {
            toast.error(result.error);
        }
        setIsUpdating(false);
    };

    return (
        <div className="space-y-6">
            {/* Workflow Status */}
            <div className="space-y-4 rounded-lg border p-4 bg-card">
                <h3 className="font-semibold text-lg">Update Workflow Status</h3>
                <div className="flex items-center gap-4">
                    <Select value={status} onValueChange={setStatus} disabled={isUpdating}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="in_production">In Production</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateStatus} disabled={isUpdating || status === order.status}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Status
                    </Button>
                </div>
            </div>

            {/* Quote Price Section */}
            <div className="space-y-4 rounded-lg border p-4 bg-card">
                <h3 className="font-semibold text-lg">Send Quote</h3>
                <p className="text-sm text-muted-foreground">
                    Enter a price quote for this custom design. Saving this will automatically move the status to "Quoted".
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Quoted Price (PKR)</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 5000"
                            value={quotePrice}
                            onChange={(e) => setQuotePrice(e.target.value)}
                            disabled={isUpdating}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Admin Notes (Internal)</Label>
                        <Textarea
                            placeholder="Notes about the design complexity, materials required, etc."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            disabled={isUpdating}
                            className="resize-none h-[100px]"
                        />
                    </div>
                </div>

                <Button onClick={handleQuotePrice} disabled={isUpdating} variant="secondary" className="w-full sm:w-auto">
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Quote & Set to Quoted
                </Button>
            </div>
        </div>
    );
}
