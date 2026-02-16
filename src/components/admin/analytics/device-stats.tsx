"use client";

import { useMemo } from "react";
import { AnalyticsList, type AnalyticsItem } from "@/components/admin/analytics/analytics-list";
import { Laptop, Smartphone, Tablet } from "lucide-react";

export interface DeviceStatData {
    device_type: string;
    active_users: number;
    sessions: number;
}

interface DeviceStatsProps {
    data?: DeviceStatData[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export function DeviceStats({ data = [], activeTab = "Devices", onTabChange }: DeviceStatsProps) {
    const items: AnalyticsItem[] = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.active_users, 0);
        const isBrowserTab = activeTab === "Browsers";

        return data.map(item => {
            let Icon = Laptop;
            if (item.device_type === 'Mobile') Icon = Smartphone;
            if (item.device_type === 'Tablet') Icon = Tablet;

            const percentage = total > 0 ? Math.round((item.active_users / total) * 100) : 0;

            return {
                label: item.device_type,
                value: percentage,
                // Only show icon for Devices tab, not for Browsers
                icon: !isBrowserTab ? <Icon className="w-4 h-4 text-gray-400" /> : undefined
            };
        });
    }, [data, activeTab]);

    return (
        <AnalyticsList
            title="Devices"
            items={items}
            metricLabel="Visitors"
            tabs={["Devices", "Browsers"]}
            activeTab={activeTab}
            onTabChange={onTabChange}
            showPercentage={true}
        />
    );
}
