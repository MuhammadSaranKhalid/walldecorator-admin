"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Palette,
  LogOut,
  Grid3x3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Customizations", href: "/admin/customizations", icon: Palette },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname?.startsWith(path);
  };

  return (
    <aside className="flex w-64 flex-col bg-card p-4 border-r">
      {/* Logo */}
      <div className="flex items-center gap-3 p-3 mb-4">
        <Grid3x3 className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">DecorAdmin</h1>
      </div>

      <div className="flex flex-col grow justify-between">
        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  active
                    ? "bg-primary/20 text-primary font-medium"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <p className="text-sm font-medium">{item.name}</p>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4">
          <div className="border-t pt-4">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors w-full">
              <LogOut className="h-5 w-5" />
              <p className="text-sm font-medium">Logout</p>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-base font-medium leading-normal">Alex Grim</h1>
              <p className="text-sm text-muted-foreground leading-normal">
                admin@decor.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

