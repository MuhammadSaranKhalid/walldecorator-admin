"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";

export function DashboardDateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentRange = searchParams.get("range") || "30";

    const handleRangeChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("range", value);
        } else {
            params.delete("range");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={currentRange} onValueChange={handleRangeChange}>
                <SelectTrigger className="w-[160px] h-10 bg-background">
                    <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
