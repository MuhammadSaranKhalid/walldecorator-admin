"use client";

import { useMemo } from "react";
import { AnalyticsList, type AnalyticsItem } from "@/components/admin/analytics/analytics-list";

// Using country codes to display flags if possible, or simple mapping
// Assuming we pass CityTrafficData[] here which contains lat/lng and city?
// Wait, for Countries list we need Country-level summary, not City.
// The existing `get_traffic_by_location` returns { country, sessions }.

export interface CountryTrafficData {
    country: string; // ISO Code
    sessions: number;
}

const getCountryName = (code: string) => {
    if (!code || code === 'Unknown') return 'Unknown';
    try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
    } catch (e) {
        return code;
    }
};

const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === 'Unknown') return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export function CountriesList({ data = [] }: { data?: CountryTrafficData[] }) {
    const items: AnalyticsItem[] = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.sessions, 0);
        return data.map(item => {
            const percentage = total > 0 ? Math.round((item.sessions / total) * 100) : 0;
            return {
                label: getCountryName(item.country),
                value: percentage,
                icon: <span className="text-base leading-none">{getFlagEmoji(item.country)}</span>
            };
        });
    }, [data]);

    return (
        <AnalyticsList
            title="Countries"
            items={items}
            metricLabel="Visitors"
            showPercentage={true}
        />
    );
}
