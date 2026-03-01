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
    return (
        <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Analytics is currently disabled.</p>
        </div>
    );
}
