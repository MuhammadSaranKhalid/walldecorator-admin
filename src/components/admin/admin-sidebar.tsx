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
  BarChart3,
  Settings,
  Tags,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Customizations", href: "/admin/customizations", icon: Palette },
  { name: "Materials", href: "/admin/materials", icon: Grid3x3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname?.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* Logo */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">
            WallDecorator
          </h1>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={active ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}
                    >
                      <Link href={item.href}>
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Bottom Section */}
      <SidebarFooter>
        <SidebarMenu>
          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="w-full">
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

