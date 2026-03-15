"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Layers,
  Palette,
  Settings,
  BarChart3,
  Plus,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  if (!mounted) {
    return null;
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/products"))}
          >
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/orders"))}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/categories"))}
          >
            <Tags className="mr-2 h-4 w-4" />
            <span>Categories</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/attributes"))}
          >
            <Layers className="mr-2 h-4 w-4" />
            <span>Attributes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/customizations"))}
          >
            <Palette className="mr-2 h-4 w-4" />
            <span>Customizations</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/products/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Product</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/categories/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Category</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/analytics"))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
