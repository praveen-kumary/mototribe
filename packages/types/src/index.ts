export type UserRole = "RIDER" | "SELLER" | "ADMIN";
export type ProductSummary = { id: string; slug: string; name: string; price: number; currency: "INR"; imageUrl?: string; rating?: number; reviewCount?: number };
export type BikeSelection = { make: string; model: string; year: number };
