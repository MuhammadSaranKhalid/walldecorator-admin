-- Analytics Summary Function
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    total_revenue NUMERIC,
    total_orders INTEGER,
    total_sessions INTEGER,
    total_pageviews INTEGER,
    conversion_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH revenue_stats AS (
        SELECT 
            COALESCE(SUM((metadata->>'value')::numeric), 0) as revenue,
            COUNT(*) as orders
        FROM analytics_events
        WHERE event_name = 'purchase'
        AND created_at BETWEEN start_date AND end_date
    ),
    traffic_stats AS (
        SELECT 
            COUNT(*) as sessions
        FROM analytics_sessions
        WHERE created_at BETWEEN start_date AND end_date
    ),
    pageview_stats AS (
        SELECT 
            COUNT(*) as pageviews
        FROM analytics_events
        WHERE event_name = 'page_view'
        AND created_at BETWEEN start_date AND end_date
    )
    SELECT 
        r.revenue,
        r.orders::INTEGER,
        t.sessions::INTEGER,
        p.pageviews::INTEGER,
        CASE 
            WHEN t.sessions > 0 THEN ROUND((r.orders::numeric / t.sessions::numeric) * 100, 2)
            ELSE 0
        END as conversion_rate
    FROM revenue_stats r, traffic_stats t, pageview_stats p;
END;
$$;

-- Daily Metrics Function (for charts)
CREATE OR REPLACE FUNCTION public.get_daily_metrics(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    date DATE,
    revenue NUMERIC,
    orders INTEGER,
    sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH dates AS (
        SELECT generate_series(
            date_trunc('day', start_date),
            date_trunc('day', end_date),
            '1 day'::interval
        )::date as day
    ),
    daily_revenue AS (
        SELECT 
            date_trunc('day', created_at)::date as day,
            SUM((metadata->>'value')::numeric) as revenue,
            COUNT(*) as orders
        FROM analytics_events
        WHERE event_name = 'purchase'
        AND created_at BETWEEN start_date AND end_date
        GROUP BY 1
    ),
    daily_sessions AS (
        SELECT 
            date_trunc('day', created_at)::date as day,
            COUNT(*) as sessions
        FROM analytics_sessions
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY 1
    )
    SELECT 
        d.day,
        COALESCE(r.revenue, 0) as revenue,
        COALESCE(r.orders, 0)::INTEGER as orders,
        COALESCE(s.sessions, 0)::INTEGER as sessions
    FROM dates d
    LEFT JOIN daily_revenue r ON d.day = r.day
    LEFT JOIN daily_sessions s ON d.day = s.day
    ORDER BY d.day;
END;
$$;

-- Top Products Function
CREATE OR REPLACE FUNCTION public.get_top_products(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    product_name TEXT,
    total_sold INTEGER,
    revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (item->>'item_name')::text as product_name,
        SUM((item->>'quantity')::integer)::integer as total_sold,
        SUM((item->>'price')::numeric * (item->>'quantity')::integer) as revenue
    FROM analytics_events,
    jsonb_array_elements(metadata->'items') as item
    WHERE event_name = 'purchase'
    AND created_at BETWEEN start_date AND end_date
    GROUP BY 1
    ORDER BY revenue DESC
    LIMIT limit_count;
END;
$$;

-- Traffic by Location Function
CREATE OR REPLACE FUNCTION public.get_traffic_by_location(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    country TEXT,
    sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(country, 'Unknown') as country,
        COUNT(*)::INTEGER as sessions
    FROM analytics_sessions
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY 1
    ORDER BY sessions DESC;
END;
$$;

-- Pakistan City Traffic Function
CREATE OR REPLACE FUNCTION public.get_pakistan_city_traffic(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    city TEXT,
    sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.city as city,
        COUNT(*)::INTEGER as sessions
    FROM analytics_sessions s
    WHERE s.created_at BETWEEN start_date AND end_date
        AND s.country = 'PK'  -- Pakistan only
        AND s.city IS NOT NULL
        AND s.city != ''
    GROUP BY s.city
    HAVING COUNT(*) > 0
    ORDER BY sessions DESC;
END;
$$;

-- Page Views Function
CREATE OR REPLACE FUNCTION public.get_page_views(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    page_path TEXT,
    active_users INTEGER,
    views INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(
            NULLIF(
                SPLIT_PART(page_url, '?', 1), 
                ''
            ), 
            '/'
        ) as page_path,
        COUNT(DISTINCT s.user_id)::INTEGER as active_users,
        COUNT(*)::INTEGER as views
    FROM analytics_events e
    JOIN analytics_sessions s ON e.session_id = s.id
    WHERE e.event_name = 'page_view'
    AND e.created_at BETWEEN start_date AND end_date
    GROUP BY 1
    ORDER BY views DESC;
END;
$$;

-- Traffic Sources Function (Referer based)
CREATE OR REPLACE FUNCTION public.get_traffic_sources(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    source TEXT,
    active_users INTEGER,
    sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN referer IS NULL OR referer = '' THEN 'Direct'
            ELSE 
                SPLIT_PART(SPLIT_PART(referer, '://', 2), '/', 1)
        END as source,
        COUNT(DISTINCT user_id)::INTEGER as active_users,
        COUNT(*)::INTEGER as sessions
    FROM analytics_sessions
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY 1
    ORDER BY sessions DESC;
END;
$$;

-- UTM Stats Function (New!)
CREATE OR REPLACE FUNCTION public.get_utm_stats(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    source TEXT,
    campaign TEXT,
    sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(utm_source, 'Direct/None') as source,
        COALESCE(utm_campaign, 'None') as campaign,
        COUNT(*)::INTEGER as sessions
    FROM analytics_sessions
    WHERE created_at BETWEEN start_date AND end_date
    AND (utm_source IS NOT NULL OR utm_campaign IS NOT NULL)
    GROUP BY 1, 2
    ORDER BY sessions DESC;
END;
$$;

-- Device Stats Function
CREATE OR REPLACE FUNCTION public.get_device_stats(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    device_type TEXT,
    active_users INTEGER,
    sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(device_type, 
            CASE 
                WHEN user_agent ~* '(iPad|Tablet)' OR (user_agent ~* 'Android' AND user_agent !~* 'Mobile') THEN 'Tablet'
                WHEN user_agent ~* '(Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini)' THEN 'Mobile'
                ELSE 'Desktop'
            END
        ) as final_device_type,
        COUNT(DISTINCT user_id)::INTEGER as active_users,
        COUNT(*)::INTEGER as sessions
    FROM analytics_sessions
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY 1
    ORDER BY active_users DESC;
END;
$$;

-- OS Stats Function
CREATE OR REPLACE FUNCTION public.get_os_stats(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    os_name TEXT,
    active_users INTEGER,
    sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(os_name,
            CASE 
                WHEN user_agent ~* 'Windows' THEN 'Windows'
                WHEN user_agent ~* 'Mac' AND user_agent !~* 'iPhone|iPad' THEN 'Mac'
                WHEN user_agent ~* 'iPhone|iPad|iPod' THEN 'iOS'
                WHEN user_agent ~* 'Android' THEN 'Android'
                WHEN user_agent ~* 'Linux' THEN 'Linux'
                ELSE 'Other'
            END
        ) as final_os_name,
        COUNT(DISTINCT user_id)::INTEGER as active_users,
        COUNT(*)::INTEGER as sessions
    FROM analytics_sessions
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY 1
    ORDER BY active_users DESC;
END;
$$;
