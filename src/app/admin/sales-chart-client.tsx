"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

interface SalesChartClientProps {
    data: { label: string; total: number }[];
}

export function SalesChartClient({ data }: SalesChartClientProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center border-dashed border-2 rounded-lg text-muted-foreground">
                No sales data available for this period.
            </div>
        );
    }

    // Format labels nicely if they look like dates "YYYY-MM-DD" or "YYYY-MM"
    const formattedData = data.map((item) => {
        let formattedLabel = item.label;
        if (item.label.length === 10) {
            // YYYY-MM-DD
            formattedLabel = format(parseISO(item.label), "MMM d");
        } else if (item.label.length === 7) {
            // YYYY-MM
            formattedLabel = format(parseISO(item.label + "-01"), "MMM yyyy");
        }
        return { ...item, formattedLabel };
    });

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={formattedData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="formattedLabel"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickMargin={10}
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                        tickFormatter={(value) => `Rs. ${value}`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                        tickMargin={10}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-background border rounded-lg shadow-sm p-3">
                                        <p className="font-medium text-sm mb-1">{label}</p>
                                        <p className="text-sm font-bold text-primary">
                                            Rs. {payload[0].value?.toLocaleString()}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fill="url(#colorTotal)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
