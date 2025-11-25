"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/admin/products" className="hover:text-foreground">
            Products
          </Link>
          <span>›</span>
          <span className="text-foreground">Edit Product</span>
        </div> */}

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {/* <h1 className="text-3xl font-bold leading-tight tracking-tight">
              Edit Product
            </h1> */}
            <p className="text-muted-foreground mt-1">
              Update product information
            </p>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm mode="edit" productId={productId} />
    </div>
  );
}
