import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { getTopProducts } from "@/lib/queries/dashboard";
import Image from "next/image";

export async function DashboardTopProducts() {
    const products = await getTopProducts(5);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    if (products.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        Top Selling Products
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[200px]">
                    <p className="text-sm font-medium text-muted-foreground">No sales data yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Check back when you receive orders to see your best sellers.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Top Selling Products
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products.map((product) => {
                        const getImageUrl = (path: string | null) => {
                            if (!path) return null;
                            if (path.startsWith('http')) return path;
                            return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
                        };

                        const imageUrl = getImageUrl(product.image_url);

                        return (
                            <div key={product.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="relative h-12 w-12 rounded bg-muted shrink-0 overflow-hidden">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                            No img
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {product.total_sold} units sold
                                    </p>
                                </div>
                                <div className="font-medium text-sm">
                                    ${product.price.toFixed(2)}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 pt-4 border-t">
                    <Link href="/admin/products" className="text-sm text-primary font-medium hover:underline text-center block w-full">
                        View All Products
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
