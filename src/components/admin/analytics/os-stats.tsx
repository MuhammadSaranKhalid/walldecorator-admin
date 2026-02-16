"use client";

import { useMemo } from "react";
import { AnalyticsList, type AnalyticsItem } from "@/components/admin/analytics/analytics-list";

export interface OSStatData {
    os_name: string;
    active_users: number;
    sessions: number;
}

export function OSStats({ data = [] }: { data?: OSStatData[] }) {
    const items: AnalyticsItem[] = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.active_users, 0);

        return data.map(item => {
            const percentage = total > 0 ? Math.round((item.active_users / total) * 100) : 0;
            return {
                label: item.os_name,
                value: percentage,
            };
        });
    }, [data]);

    return (
        <AnalyticsList
            title="Operating Systems"
            items={items}
            metricLabel="Visitors"
            showPercentage={true}
        />
    );
}
