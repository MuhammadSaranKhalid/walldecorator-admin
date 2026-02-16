"use client";

import { useMemo } from "react";
import { AnalyticsList, type AnalyticsItem } from "@/components/admin/analytics/analytics-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

export interface TrafficSourceData {
    source: string;
    active_users: number;
    sessions: number;
}

export function TrafficSourcesTable({ data = [] }: { data?: TrafficSourceData[] }) {
    // Transform data for AnalyticsList
    const items: AnalyticsItem[] = useMemo(() => {
        return data.map(item => ({
            label: item.source,
            value: item.active_users, // Changed to active_users to match "Visitors" label
            icon: <div className="w-4 h-4 rounded-sm bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 uppercase overflow-hidden">
                {item.source !== 'Direct' && item.source.length > 0 ? (
                    // Simple favicon proxy or initial can be used here. For now, first letter.
                    // A real implementation might use: <img src={`https://www.google.com/s2/favicons?domain=${item.source}`} ... />
                    <img src={`https://www.google.com/s2/favicons?domain=${item.source}&sz=16`} alt={item.source} className="w-full h-full object-cover opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                    <Globe className="w-3 h-3 text-gray-400" />
                )}
            </div>
        }));
    }, [data]);

    return (
        <Card className="col-span-3 border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-0">
                <CardTitle className="sr-only">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <AnalyticsList
                    title="Referrers"
                    items={items}
                    metricLabel="Visitors"
                    tabs={["Referrers", "UTM Parameters"]}
                    activeTab="Referrers"
                />
            </CardContent>
        </Card>
    );
}
