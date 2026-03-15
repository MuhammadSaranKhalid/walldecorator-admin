"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const routeNames: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  orders: "Orders",
  categories: "Categories",
  attributes: "Attributes",
  customizations: "Customizations",
  analytics: "Analytics",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Split pathname and filter out empty strings
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the main admin dashboard
  if (segments.length <= 1) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    // Check if segment is a UUID or number (likely an ID)
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || /^\d+$/.test(segment);

    let label = routeNames[segment.toLowerCase()] || segment;

    // Format IDs nicely
    if (isId) {
      label = `#${segment.substring(0, 8)}`;
    }

    // Capitalize first letter if not in routeNames
    if (!routeNames[segment.toLowerCase()] && !isId) {
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    return {
      label,
      path,
      isLast,
      isId,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {/* Home Icon */}
      <Link
        href="/admin"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {breadcrumbItems.map((item, index) => (
        <Fragment key={item.path}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.isLast ? (
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.path}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
            >
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
