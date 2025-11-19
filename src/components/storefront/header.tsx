"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, Grid3x3, ChevronDown } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { language, currency, setLanguage, setCurrency } = usePreferencesStore();
  
  const totalItems = getTotalItems();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <Grid3x3 className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold">WallDecor Co.</h2>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-9">
              <Link 
                href="/" 
                className={cn(
                  "text-sm font-medium hover:text-primary transition-colors",
                  isActive("/") && pathname === "/" ? "text-primary font-bold" : ""
                )}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className={cn(
                  "text-sm font-medium hover:text-primary transition-colors",
                  isActive("/products") ? "text-primary font-bold" : ""
                )}
              >
                Shop
              </Link>
              <Link 
                href="/about" 
                className={cn(
                  "text-sm font-medium hover:text-primary transition-colors",
                  isActive("/about") ? "text-primary font-bold" : ""
                )}
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-4">
              <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                <SelectTrigger className="w-[110px] border-0 bg-transparent text-sm font-medium hover:text-primary focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currency} onValueChange={(value) => setCurrency(value as any)}>
                <SelectTrigger className="w-[100px] border-0 bg-transparent text-sm font-medium hover:text-primary focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dollar">Dollar</SelectItem>
                  <SelectItem value="Euro">Euro</SelectItem>
                  <SelectItem value="Rupees">Rupees</SelectItem>
                </SelectContent>
              </Select>

              <ThemeToggle />
            </div>

            {/* Cart Button */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-1 mt-8">
                    <Link 
                      href="/" 
                      className={cn(
                        "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                        isActive("/") && pathname === "/"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-primary"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      href="/products" 
                      className={cn(
                        "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                        isActive("/products")
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-primary"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link 
                      href="/about" 
                      className={cn(
                        "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                        isActive("/about")
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-primary"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </nav>
                  
                  {/* Settings Section */}
                  <div className="mt-auto mb-6 space-y-6 pt-6 border-t">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Language
                      </label>
                      <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Currency
                      </label>
                      <Select value={currency} onValueChange={(value) => setCurrency(value as any)}>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dollar">Dollar ($)</SelectItem>
                          <SelectItem value="Euro">Euro (€)</SelectItem>
                          <SelectItem value="Rupees">Rupees (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Theme
                      </label>
                      <div className="flex items-center justify-start">
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

