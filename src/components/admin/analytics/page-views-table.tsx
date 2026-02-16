"use client";

import { useMemo } from "react";
import { AnalyticsList, type AnalyticsItem } from "@/components/admin/analytics/analytics-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PageViewData {
    page_path: string;
    active_users: number; // or calculate from views
    views: number;
}

export function PageViewsTable({ data = [] }: { data?: PageViewData[] }) {
    // Transform data for AnalyticsList
    const items: AnalyticsItem[] = useMemo(() => {
        return data.map(item => {
            // Clean up URL: remove protocol/host if present
            let label = item.page_path;
            try {
                if (label.startsWith('http')) {
                    const url = new URL(label);
                    label = url.pathname + url.search;
                }
            } catch (e) {
                // Keep original if parsing fails
            }

            return {
                label: label,
                value: item.active_users,
            };
        });
    }, [data]);

    return (
        <Card className="col-span-4 border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-0">
                <CardTitle className="sr-only">Page Views</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <AnalyticsList
                    title="Pages"
                    items={items}
                    metricLabel="Visitors"
                    tabs={["Pages", "Routes", "Hostnames"]}
                    activeTab="Pages"
                />
            </CardContent>
        </Card>
    );
}
