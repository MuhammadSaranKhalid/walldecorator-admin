import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  material: string;
  price: number;
  image_url: string;
  className?: string;
}

export function ProductCard({ id, name, material, price, image_url, className }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className={cn("flex flex-col gap-3 group", className)}>
      <div className="relative w-full overflow-hidden rounded-lg aspect-[3/4] bg-muted">
        <Image
          src={image_url}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div>
        <p className="text-foreground text-base font-medium leading-normal">{name}</p>
        <p className="text-muted-foreground text-sm font-normal leading-normal">{material}</p>
        <p className="text-foreground text-sm font-semibold leading-normal">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
}

