"use client";

import { Bell, Package, ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Mock notifications - Replace with real data from your API
const mockNotifications = [
  {
    id: "1",
    type: "order" as const,
    title: "New order received",
    message: "Order #12345 from John Doe",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    link: "/admin/orders/12345",
  },
  {
    id: "2",
    type: "inventory" as const,
    title: "Low stock alert",
    message: "Mountain Biker 'Peak Performance' has only 3 units left",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    link: "/admin/products",
  },
  {
    id: "3",
    type: "success" as const,
    title: "Product published",
    message: "Wall Art Canvas has been published successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    link: "/admin/products",
  },
];

const notificationIcons = {
  order: ShoppingCart,
  inventory: AlertTriangle,
  product: Package,
  success: CheckCircle,
};

const notificationColors = {
  order: "text-blue-500",
  inventory: "text-orange-600",
  product: "text-purple-500",
  success: "text-green-600",
};

export function NotificationsDropdown() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {mockNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {mockNotifications.map((notification, index) => {
              const Icon = notificationIcons[notification.type];
              const iconColor = notificationColors[notification.type];

              return (
                <Link key={notification.id} href={notification.link}>
                  <DropdownMenuItem
                    className={`flex items-start gap-3 p-3 cursor-pointer ${
                      !notification.read ? "bg-accent/50" : ""
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </DropdownMenuItem>
                </Link>
              );
            })}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/admin/notifications"
            className="w-full text-center text-sm text-primary cursor-pointer"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
