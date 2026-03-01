import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { getLowStockAlerts } from "@/lib/queries/dashboard";

export async function DashboardInventoryAlerts() {
    const alerts = await getLowStockAlerts(5);

    if (alerts.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        Inventory Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[200px]">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">All stock levels are healthy</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        No products are currently running low on inventory.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Low Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{alert.product_name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <span>{alert.sku}</span>
                                    {alert.size && <span>• {alert.size}</span>}
                                    {alert.material && <span>• {alert.material}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300">
                                    {alert.quantity_available} left
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                    <Link href="/admin/products" className="text-sm text-primary font-medium hover:underline text-center block w-full">
                        Manage Inventory
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
