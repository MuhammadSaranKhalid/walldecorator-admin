"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import { DeviceStats } from "@/components/admin/analytics/device-stats";
import { CountriesList } from "@/components/admin/analytics/countries-list";
import { OSStats } from "@/components/admin/analytics/os-stats";
import { AnalyticsList, type AnalyticsItem } from "@/components/admin/analytics/analytics-list";
import { PakistanTrafficMap } from "@/components/admin/analytics/pakistan-traffic-map";
import { mergePakistanCityData, type CityTrafficFromDB } from "@/utils/analytics/pakistan-city-merger";

interface DailyMetric {
    date: string;
    revenue: number;
    orders: number;
    sessions: number;
}

interface PageViewData {
    page_path: string;
    active_users: number;
    views: number;
}

interface TrafficSourceData {
    source: string;
    active_users: number;
    sessions: number;
}

// Dummy data for UI development
// Visitors data
const DUMMY_VISITORS_METRICS: DailyMetric[] = [
    { date: "2024-11-09", revenue: 0, orders: 0, sessions: 80 },
    { date: "2024-11-10", revenue: 0, orders: 0, sessions: 50 },
    { date: "2024-11-11", revenue: 0, orders: 0, sessions: 60 },
    { date: "2024-11-12", revenue: 0, orders: 0, sessions: 85 },
    { date: "2024-11-13", revenue: 0, orders: 0, sessions: 110 },
    { date: "2024-11-14", revenue: 0, orders: 0, sessions: 48 },
    { date: "2024-11-15", revenue: 0, orders: 0, sessions: 95 },
    { date: "2024-11-16", revenue: 0, orders: 0, sessions: 135 },
    { date: "2024-11-17", revenue: 0, orders: 0, sessions: 25 },
    { date: "2024-11-18", revenue: 0, orders: 0, sessions: 150 },
    { date: "2024-11-19", revenue: 0, orders: 0, sessions: 30 },
    { date: "2024-11-20", revenue: 0, orders: 0, sessions: 32 },
    { date: "2024-11-21", revenue: 0, orders: 0, sessions: 35 },
    { date: "2024-11-22", revenue: 0, orders: 0, sessions: 38 },
    { date: "2024-11-23", revenue: 0, orders: 0, sessions: 40 },
];

// Page Views data
const DUMMY_PAGEVIEWS_METRICS: DailyMetric[] = [
    { date: "2024-11-09", revenue: 0, orders: 0, sessions: 70 },
    { date: "2024-11-10", revenue: 0, orders: 0, sessions: 65 },
    { date: "2024-11-11", revenue: 0, orders: 0, sessions: 80 },
    { date: "2024-11-12", revenue: 0, orders: 0, sessions: 95 },
    { date: "2024-11-13", revenue: 0, orders: 0, sessions: 105 },
    { date: "2024-11-14", revenue: 0, orders: 0, sessions: 55 },
    { date: "2024-11-15", revenue: 0, orders: 0, sessions: 88 },
    { date: "2024-11-16", revenue: 0, orders: 0, sessions: 120 },
    { date: "2024-11-17", revenue: 0, orders: 0, sessions: 35 },
    { date: "2024-11-18", revenue: 0, orders: 0, sessions: 140 },
    { date: "2024-11-19", revenue: 0, orders: 0, sessions: 45 },
    { date: "2024-11-20", revenue: 0, orders: 0, sessions: 50 },
    { date: "2024-11-21", revenue: 0, orders: 0, sessions: 52 },
    { date: "2024-11-22", revenue: 0, orders: 0, sessions: 55 },
    { date: "2024-11-23", revenue: 0, orders: 0, sessions: 58 },
];

// Bounce Rate data
const DUMMY_BOUNCERATE_METRICS: DailyMetric[] = [
    { date: "2024-11-09", revenue: 0, orders: 0, sessions: 45 },
    { date: "2024-11-10", revenue: 0, orders: 0, sessions: 42 },
    { date: "2024-11-11", revenue: 0, orders: 0, sessions: 48 },
    { date: "2024-11-12", revenue: 0, orders: 0, sessions: 52 },
    { date: "2024-11-13", revenue: 0, orders: 0, sessions: 55 },
    { date: "2024-11-14", revenue: 0, orders: 0, sessions: 38 },
    { date: "2024-11-15", revenue: 0, orders: 0, sessions: 60 },
    { date: "2024-11-16", revenue: 0, orders: 0, sessions: 65 },
    { date: "2024-11-17", revenue: 0, orders: 0, sessions: 30 },
    { date: "2024-11-18", revenue: 0, orders: 0, sessions: 70 },
    { date: "2024-11-19", revenue: 0, orders: 0, sessions: 44 },
    { date: "2024-11-20", revenue: 0, orders: 0, sessions: 46 },
    { date: "2024-11-21", revenue: 0, orders: 0, sessions: 47 },
    { date: "2024-11-22", revenue: 0, orders: 0, sessions: 48 },
    { date: "2024-11-23", revenue: 0, orders: 0, sessions: 49 },
];

// Pages Tab Data
const DUMMY_PAGE_VIEWS: PageViewData[] = [
    { page_path: "/", active_users: 155, views: 250 },
    { page_path: "/start", active_users: 57, views: 80 },
    { page_path: "/dashboard", active_users: 51, views: 65 },
    { page_path: "/dashboard/reports", active_users: 33, views: 45 },
    { page_path: "/thank-you", active_users: 24, views: 30 },
    { page_path: "/login", active_users: 13, views: 15 },
    { page_path: "/contact", active_users: 12, views: 14 },
];

// Routes Tab Data
const DUMMY_ROUTES: PageViewData[] = [
    { page_path: "/api/users", active_users: 89, views: 120 },
    { page_path: "/api/products", active_users: 67, views: 95 },
    { page_path: "/api/orders", active_users: 45, views: 60 },
    { page_path: "/api/analytics", active_users: 34, views: 48 },
    { page_path: "/api/auth", active_users: 28, views: 35 },
];

// Hostnames Tab Data
const DUMMY_HOSTNAMES: PageViewData[] = [
    { page_path: "walldecorator.com", active_users: 280, views: 450 },
    { page_path: "www.walldecorator.com", active_users: 32, views: 45 },
];

// Referrers Tab Data
const DUMMY_TRAFFIC_SOURCES: TrafficSourceData[] = [
    { source: "Direct", active_users: 280, sessions: 290 },
    { source: "google.com", active_users: 18, sessions: 20 },
    { source: "facebook.com", active_users: 8, sessions: 10 },
    { source: "twitter.com", active_users: 6, sessions: 8 },
];

// UTM Parameters Tab Data
const DUMMY_UTM_PARAMS: TrafficSourceData[] = [
    { source: "utm_source=google", active_users: 45, sessions: 50 },
    { source: "utm_source=facebook", active_users: 32, sessions: 38 },
    { source: "utm_campaign=summer_sale", active_users: 28, sessions: 30 },
    { source: "utm_medium=email", active_users: 15, sessions: 18 },
];

// Devices Tab Data
const DUMMY_DEVICE_STATS = [
    { device_type: "Desktop", active_users: 237, sessions: 237 },
    { device_type: "Mobile", active_users: 75, sessions: 75 },
];

// Browsers Tab Data
const DUMMY_BROWSER_STATS = [
    { device_type: "Chrome", active_users: 180, sessions: 180 },
    { device_type: "Safari", active_users: 78, sessions: 78 },
    { device_type: "Firefox", active_users: 35, sessions: 35 },
    { device_type: "Edge", active_users: 19, sessions: 19 },
];

const DUMMY_COUNTRIES = [
    { country: "PK", sessions: 172 },
    { country: "US", sessions: 109 },
    { country: "CN", sessions: 16 },
    { country: "DE", sessions: 15 },
];

const DUMMY_OS_STATS = [
    { os_name: "Mac", active_users: 125, sessions: 125 },
    { os_name: "Windows", active_users: 106, sessions: 106 },
    { os_name: "iOS", active_users: 50, sessions: 50 },
    { os_name: "Android", active_users: 28, sessions: 28 },
];

// Pakistan City Traffic Data
const DUMMY_PAKISTAN_CITIES: CityTrafficFromDB[] = [
    { city: "Karachi", sessions: 85 },
    { city: "Lahore", sessions: 62 },
    { city: "Islamabad", sessions: 45 },
    { city: "Rawalpindi", sessions: 38 },
    { city: "Faisalabad", sessions: 28 },
    { city: "Multan", sessions: 22 },
    { city: "Peshawar", sessions: 18 },
    { city: "Quetta", sessions: 12 },
    { city: "Sialkot", sessions: 10 },
    { city: "Gujranwala", sessions: 8 },
];

export default function AnalyticsPage() {
    const [activePageTab, setActivePageTab] = useState("Pages");
    const [activeReferrerTab, setActiveReferrerTab] = useState("Referrers");
    const [activeDeviceTab, setActiveDeviceTab] = useState("Devices");
    const [selectedMetric, setSelectedMetric] = useState<"visitors" | "pageviews" | "bouncerate">("visitors");

    // Get chart data based on selected metric
    const getChartData = () => {
        switch (selectedMetric) {
            case "pageviews":
                return DUMMY_PAGEVIEWS_METRICS;
            case "bouncerate":
                return DUMMY_BOUNCERATE_METRICS;
            default:
                return DUMMY_VISITORS_METRICS;
        }
    };

    const dailyMetrics = getChartData();
    const countriesData = DUMMY_COUNTRIES;
    const osStats = DUMMY_OS_STATS;

    // Process Pakistan city traffic data
    const cityTrafficData = mergePakistanCityData(DUMMY_PAKISTAN_CITIES);

    // Get data based on active tabs
    const getPageData = () => {
        switch (activePageTab) {
            case "Routes":
                return DUMMY_ROUTES;
            case "Hostnames":
                return DUMMY_HOSTNAMES;
            default:
                return DUMMY_PAGE_VIEWS;
        }
    };

    const getReferrerData = () => {
        switch (activeReferrerTab) {
            case "UTM Parameters":
                return DUMMY_UTM_PARAMS;
            default:
                return DUMMY_TRAFFIC_SOURCES;
        }
    };

    const getDeviceData = () => {
        switch (activeDeviceTab) {
            case "Browsers":
                return DUMMY_BROWSER_STATS;
            default:
                return DUMMY_DEVICE_STATS;
        }
    };

    const pageViews = getPageData();
    const trafficSources = getReferrerData();
    const deviceStats = getDeviceData();

    // Transform page views data for the list
    const pageViewItems: AnalyticsItem[] = pageViews.map(item => {
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

    // Transform traffic sources for the list
    const trafficSourceItems: AnalyticsItem[] = trafficSources.map(item => ({
        label: item.source,
        value: item.active_users,
    }));

    return (
        <div className="flex-1 space-y-6 p-8">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-3 gap-8">
                <button
                    onClick={() => setSelectedMetric("visitors")}
                    className={cn(
                        "pb-5 text-left transition-all hover:opacity-80",
                        selectedMetric === "visitors" ? "border-b-2 border-foreground" : ""
                    )}
                >
                    <div className="text-sm text-muted-foreground mb-2">Visitors</div>
                    <div className="flex items-center gap-3">
                        <div className="text-5xl font-bold">50</div>
                        <span className="text-sm font-medium px-2.5 py-1 bg-red-50 text-red-600 rounded">-65%</span>
                    </div>
                </button>
                <button
                    onClick={() => setSelectedMetric("pageviews")}
                    className={cn(
                        "pb-5 text-left transition-all hover:opacity-80",
                        selectedMetric === "pageviews" ? "border-b-2 border-foreground" : ""
                    )}
                >
                    <div className="text-sm text-muted-foreground mb-2">Page Views</div>
                    <div className="flex items-center gap-3">
                        <div className="text-5xl font-bold">338</div>
                        <span className="text-sm font-medium px-2.5 py-1 bg-red-50 text-red-600 rounded">-59%</span>
                    </div>
                </button>
                <button
                    onClick={() => setSelectedMetric("bouncerate")}
                    className={cn(
                        "pb-5 text-left transition-all hover:opacity-80",
                        selectedMetric === "bouncerate" ? "border-b-2 border-foreground" : ""
                    )}
                >
                    <div className="text-sm text-muted-foreground mb-2">Bounce Rate</div>
                    <div className="flex items-center gap-3">
                        <div className="text-5xl font-bold">46%</div>
                        <span className="text-sm font-medium px-2.5 py-1 bg-red-50 text-red-600 rounded">+7%</span>
                    </div>
                </button>
            </div>

            {/* Area Chart */}
            <Card className="border border-gray-200 shadow-none rounded-lg">
                <CardContent className="p-8">
                    <ResponsiveContainer width="100%" height={340}>
                        <AreaChart data={dailyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" horizontal={true} vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => format(new Date(value), "MMM d")}
                                stroke="#999"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={8}
                            />
                            <YAxis
                                stroke="#999"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 100]}
                                ticks={[0, 50, 100]}
                                dx={-5}
                            />
                            <Area
                                type="linear"
                                dataKey="sessions"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                fill="url(#colorSessions)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Pakistan City Traffic Map */}
            <Card className="border border-gray-200 shadow-none rounded-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="w-full">
                        <PakistanTrafficMap
                            cityData={cityTrafficData}
                            showCities={true}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Pages and Referrers - 2 Column Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Pages Section */}
                <Card className="border py-3 border-gray-200 shadow-none rounded-lg overflow-hidden h-[400px]">
                    <AnalyticsList
                        title=""
                        items={pageViewItems}
                        metricLabel="Visitors"
                        tabs={["Pages", "Routes", "Hostnames"]}
                        activeTab={activePageTab}
                        onTabChange={setActivePageTab}
                    />
                </Card>

                {/* Referrers Section */}
                <Card className="border py-3 border-gray-200 shadow-none rounded-lg overflow-hidden h-[400px]">
                    <AnalyticsList
                        title=""
                        items={trafficSourceItems}
                        metricLabel="Visitors"
                        tabs={["Referrers", "UTM Parameters"]}
                        activeTab={activeReferrerTab}
                        onTabChange={setActiveReferrerTab}
                    />
                </Card>
            </div>

            {/* Countries, Devices, OS - 3 Column Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border border-gray-200 shadow-none rounded-lg overflow-hidden h-[340px]">
                    <CountriesList data={countriesData} />
                </Card>
                <Card className="border border-gray-200 shadow-none rounded-lg overflow-hidden h-[340px]">
                    <DeviceStats
                        data={deviceStats}
                        activeTab={activeDeviceTab}
                        onTabChange={setActiveDeviceTab}
                    />
                </Card>
                <Card className="border border-gray-200 shadow-none rounded-lg overflow-hidden h-[340px]">
                    <OSStats data={osStats} />
                </Card>
            </div>

            {/* Events and Pages Sections */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border border-gray-200 shadow-none rounded-lg h-[380px]">
                    <CardHeader className="pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-semibold">Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col h-[280px] items-center justify-center text-sm text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <line x1="12" x2="12" y1="20" y2="10" />
                                    <line x1="18" x2="18" y1="20" y2="4" />
                                    <line x1="6" x2="6" y1="20" y2="16" />
                                </svg>
                            </div>
                            <span className="text-gray-500 text-sm">No custom events</span>
                            <p className="text-xs text-gray-400 mt-2 text-center px-6">
                                Set up custom events to gain a deeper understanding of user behavior on your site.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border border-gray-200 shadow-none rounded-lg h-[380px]">
                    <CardHeader className="pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-semibold">Pages</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col h-[280px] items-center justify-center text-sm text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <span className="text-gray-500 text-sm">No flags</span>
                            <p className="text-xs text-gray-400 mt-2 text-center px-6">
                                Gain insights into how active feature flags impact user behavior.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
