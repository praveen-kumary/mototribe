"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../../components/auth-provider";
import { Package } from "lucide-react";
import { useSellerProducts, useCreateProduct, useUpdateProduct } from "../../../features/marketplace/hooks/useProducts";
import { useSellerOrders } from "../../../features/marketplace/hooks/useOrders";

import { SellerSidebar } from "./components/sidebar";
import { SellerTopbar } from "./components/topbar";
import { SellerDashboardView } from "./components/dashboard-view";
import { SellerProductsView } from "./components/products-view";
import { SellerProductForm } from "./components/product-form";
import { SellerOrdersView } from "./components/orders-view";
import { SellerInventoryView } from "./components/inventory-view";
import { SellerReturnsView } from "./components/returns-view";
import { SellerCouponsView } from "./components/coupons-view";
import { SellerPayoutsView } from "./components/payouts-view";
import { SellerReviewsView } from "./components/reviews-view";
import { SellerMarketingView } from "./components/marketing-view";
import { SellerShippingView } from "./components/shipping-view";
import { SellerEventsView } from "./components/events-view";
import { SellerBlogView } from "./components/blog-view";
import { SellerCreatorsView } from "./components/creators-view";
import { SellerGarageView } from "./components/garage-view";
import { SellerAnalyticsView } from "./components/analytics-view";
import { SellerSettingsView } from "./components/settings-view";
import { SellerMessagesView } from "./components/messages-view";

const EMPTY_FORM = {
  name: "", description: "", price: "", comparePrice: "", costPrice: "",
  sku: "", barcode: "", weight: "", stock: "", category: "Accessories",
  bike: "Universal fit", image: "", tags: "",
  metaTitle: "", metaDescription: "", status: "ACTIVE" as "ACTIVE" | "DRAFT",
};

export default function SellerDashboard() {
  const { user, signOut } = useAuth();
  const messagesCount = 0;
  
  // All data fetching uses JWT-based endpoints — no sellerId in URL
  const { data: sellerProducts = [] } = useSellerProducts();
  const { data: sellerOrders = [] } = useSellerOrders();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || "Dashboard";
  
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/seller?${params.toString()}`);
  };
  
  // Form State
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // UI State
  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        comparePrice: Number(form.comparePrice) || undefined,
        costPrice: Number(form.costPrice) || undefined,
        sku: form.sku || undefined,
        barcode: form.barcode || undefined,
        weight: form.weight || undefined,
        stock: Number(form.stock) || 0,
        category: form.category,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        status: form.status,
      };

      if (editingId) {
        await updateProductMutation.mutateAsync({ productId: editingId, data: payload });
        showToast("✅ Product updated successfully");
      } else {
        await createProductMutation.mutateAsync(payload);
        showToast("✅ Product published to marketplace");
      }

      setForm({ ...EMPTY_FORM });
      setEditingId(null);
      setActiveTab("Products");
    } catch (err: any) {
      showToast(`❌ ${err.message || "Failed to save product. Please try again."}`);
    }
  };

  const handleEditProduct = (p: any) => {
    setForm({
      name: p.name, description: p.description || "", price: String(p.price || 0), comparePrice: String(p.comparePrice || ""),
      costPrice: String(p.costPrice || ""), sku: p.sku || "", barcode: p.barcode || "", weight: p.weight || "",
      stock: String(p.stock || 0), category: p.category || "Accessories", bike: p.bike || "Universal fit", image: p.image || p.images?.[0]?.url || "", tags: p.tags ? p.tags.join(", ") : "",
      metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "",
      status: p.status === "ARCHIVED" ? "ACTIVE" : p.status as "ACTIVE" | "DRAFT",
    });
    setEditingId(p.id);
    setActiveTab("Add Product");
  };

  const handleDuplicateProduct = (p: any) => {
    handleEditProduct(p);
    setEditingId(null); 
    setForm((f: any) => ({ ...f, name: `${f.name} (Copy)` }));
  };

  const statusColor = (s: string) => {
    if (s === "PENDING" || s === "DRAFT" || s === "PAYMENT_PENDING") return "bg-zinc-500/20 text-muted";
    if (s === "ACTIVE" || s === "DELIVERED" || s === "CONFIRMED") return "bg-emerald-500/20 text-emerald-400";
    if (s === "ARCHIVED" || s === "CANCELLED" || s === "PAYMENT_FAILED") return "bg-red-500/20 text-red-400";
    if (s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY" || s === "PACKING" || s === "READY_TO_SHIP") return "bg-blue-500/20 text-blue-400";
    return "bg-zinc-500/20 text-muted";
  };

  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) return null;

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-foreground">Loading...</div>}>
      <div className="flex h-screen bg-background text-foreground font-sans">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-surface border border-border rounded-xl shadow-2xl text-[13px] font-semibold animate-in slide-in-from-right">
          {toast}
        </div>
      )}

      <SellerSidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        productsCount={sellerProducts.length} ordersCount={sellerOrders.length}
        messagesCount={messagesCount} signOut={signOut}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background hide-scrollbar">
        <SellerTopbar user={user} setMobileMenuOpen={setMobileMenuOpen} onAddProduct={() => { setForm({ ...EMPTY_FORM }); setEditingId(null); setActiveTab("Add Product"); }} signOut={signOut} />

        <div className="p-6 max-w-[1200px] w-full mx-auto space-y-6">
          {activeTab === "Dashboard" && (
            <SellerDashboardView setActiveTab={setActiveTab} statusColor={statusColor} />
          )}

          {activeTab === "Products" && (
            <SellerProductsView
              setActiveTab={setActiveTab}
              setForm={setForm}
              EMPTY_FORM={EMPTY_FORM}
              setEditingId={setEditingId}
              handleEditProduct={handleEditProduct}
              handleDuplicateProduct={handleDuplicateProduct}
            />
          )}

          {activeTab === "Add Product" && (
            <SellerProductForm
              form={form}
              setForm={setForm}
              EMPTY_FORM={EMPTY_FORM}
              handleSaveProduct={handleSaveProduct}
              setActiveTab={setActiveTab}
              editingId={editingId}
            />
          )}

          {activeTab === "Orders" && (
            <SellerOrdersView />
          )}

          {activeTab === "Buyer Messages" && <SellerMessagesView />}
          {activeTab === "Inventory" && <SellerInventoryView />}
          {activeTab === "Returns & Refunds" && <SellerReturnsView />}
          {activeTab === "Coupons" && <SellerCouponsView />}
          {activeTab === "Payouts" && <SellerPayoutsView />}
          {activeTab === "Reviews" && <SellerReviewsView />}
          {activeTab === "Marketing" && <SellerMarketingView />}
          {activeTab === "Shipping Settings" && <SellerShippingView />}
          {activeTab === "Events" && <SellerEventsView />}
          {activeTab === "Blog & Guides" && <SellerBlogView />}
          {activeTab === "Creators" && <SellerCreatorsView />}
          {activeTab === "Garage Network" && <SellerGarageView />}
          {activeTab === "Analytics" && <SellerAnalyticsView />}
          {activeTab === "Sales Reports" && <SellerAnalyticsView />}
          {activeTab === "Store Settings" && <SellerSettingsView />}

          {/* Fallback for unknown tabs */}
          {!["Dashboard", "Products", "Add Product", "Orders", "Buyer Messages", "Inventory", "Returns & Refunds", "Coupons", "Payouts", "Reviews", "Marketing", "Shipping Settings", "Events", "Blog & Guides", "Creators", "Garage Network", "Analytics", "Sales Reports", "Store Settings"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h1 className="text-xl font-bold">{activeTab}</h1>
              <p className="text-muted text-[13px] mt-2">This section is coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
    </Suspense>
  );
}
