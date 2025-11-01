"use client";

import ProductCard from "@/components/ProductCard";
import { Section } from "@/components/Section";
import { Product } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useRequireAuth } from "@/hooks/useSession";

const trackedProducts: Product[] = [
  {
    _id: "1",
    name: "Puma T-Shirt",
    image:
      "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24219990/2023/7/27/710b0ded-05f9-4a8d-8971-df505537f83e1690436621869RARERABBITMenNavyBlueSlimFitTrousers5.jpg",
    url: "",
    domain: "myntra.com",
    currency: "₹",
    availability: "In Stock",
    currentPrice: 799,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "Woodland Shoes",
    image:
      "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24219990/2023/7/27/710b0ded-05f9-4a8d-8971-df505537f83e1690436621869RARERABBITMenNavyBlueSlimFitTrousers5.jpg",
    url: "",
    domain: "myntra.com",
    currency: "₹",
    availability: "In Stock",
    currentPrice: 3499,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  const session = useRequireAuth();

  if (session.status !== "authenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const displayName = session.user?.nickname ?? session.user?.email ?? "there";

  return (
    <Section>
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your tracked products today.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trackedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </Section>
  );
}
