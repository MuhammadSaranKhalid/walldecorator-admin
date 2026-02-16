"use client";

import { cn } from "@/lib/utils";

export interface AnalyticsItem {
    label: string;
    value: number;
    icon?: React.ReactNode;
    code?: string; // for flags or other identifiers
}

interface AnalyticsListProps {
    title: string;
    items: AnalyticsItem[];
    metricLabel?: string;
    className?: string;
    onTabChange?: (tab: string) => void;
    tabs?: string[];
    activeTab?: string;
    showPercentage?: boolean;
}

export function AnalyticsList({
    title,
    items,
    metricLabel = "Visitors",
    className,
    tabs,
    activeTab,
    onTabChange,
    showPercentage = false
}: AnalyticsListProps) {
    // specific logic for max value to calculate percentages for bar width
    const maxValue = Math.max(...items.map(item => item.value), 1);

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header with tabs */}
            <div className="flex items-center justify-between px-6 pb-2.5 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-6">
                    {tabs && tabs.length > 0 ? (
                        <div className="flex gap-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange?.(tab)}
                                    className={cn(
                                        "text-sm font-medium transition-all pb-2.5 border-b-2 -mb-[11px]",
                                        activeTab === tab
                                            ? "text-foreground border-foreground"
                                            : "text-muted-foreground border-transparent hover:text-foreground/80"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    ) : title ? (
                        <h3 className="text-sm font-medium">{title}</h3>
                    ) : null}
                </div>
                {metricLabel && (
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{metricLabel}</span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col overflow-y-auto flex-1">
                {items.length === 0 ? (
                    <div className="flex flex-col h-[300px] items-center justify-center text-sm text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <line x1="12" x2="12" y1="20" y2="10" />
                                <line x1="18" x2="18" y1="20" y2="4" />
                                <line x1="6" x2="6" y1="20" y2="16" />
                            </svg>
                        </div>
                        <span className="text-gray-500">No data available</span>
                    </div>
                ) : (
                    items.map((item, index) => {
                        const percentage = (item.value / maxValue) * 100;
                        return (
                            <div key={index} className="relative flex items-center justify-between py-2.5 px-6 hover:bg-gray-50/50 transition-colors">
                                {/* Background Bar */}
                                <div
                                    className="absolute left-0 top-0.5 bottom-0.5 bg-gray-100/80 z-0 rounded-r-sm"
                                    style={{ width: `${percentage}%` }}
                                />

                                {/* Content */}
                                <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                                    {item.icon && <span className="shrink-0 text-muted-foreground">{item.icon}</span>}
                                    <span className="text-sm text-gray-900 truncate">
                                        {item.label}
                                    </span>
                                </div>
                                <span className="relative z-10 text-sm font-medium text-gray-900 ml-4 tabular-nums">
                                    {showPercentage ? `${item.value}%` : item.value.toLocaleString()}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
