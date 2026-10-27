"use client";
import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Check, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../../components/auth-provider";
import { useAllOrders } from "../../../features/marketplace/hooks/useOrders";
import { useAllProducts, useDeleteProduct, useUpdateProductStatus } from "../../../features/marketplace/hooks/useProducts";
import { useSellers, useApproveSeller, useRejectSeller } from "../../../features/seller/hooks/useSellers";

import { AdminSidebar } from "./components/sidebar";
import { AdminTopbar } from "./components/topbar";
import { AdminDashboardView } from "./components/dashboard-view";
import { AdminSellersView } from "./components/sellers-view";
import { AdminUsersView } from "./components/users-view";
import { AdminProductsView } from "./components/products-view";
import { AdminOrdersView } from "./components/orders-view";
import { AdminDisputesView } from "./components/disputes-view";
import { AdminReturnsView } from "./components/returns-view";
import { AdminCouponsView } from "./components/coupons-view";
import { AdminPayoutsView } from "./components/payouts-view";
import { AdminReviewsView } from "./components/reviews-view";
import { AdminMarketingView } from "./components/marketing-view";
import { AdminShippingView } from "./components/shipping-view";
import { AdminEventsView } from "./components/events-view";
import { AdminBlogView } from "./components/blog-view";
import { AdminCommunityView } from "./components/community-view";
import { AdminCreatorsView } from "./components/creators-view";
import { AdminGarageView } from "./components/garage-view";
import { AdminAnalyticsView } from "./components/analytics-view";
import { AdminLogsView } from "./components/logs-view";
import { AdminRolesView } from "./components/roles-view";
import { AdminSettingsView } from "./components/settings-view";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || "Dashboard";
  
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/admin?${params.toString()}`);
  };
  
  // Real data from API
  const { data: apiOrders = [] } = useAllOrders();
  const { data: apiUsers = [] } = useSellers();
  const { data: apiProducts = [] } = useAllProducts();

  // Real API mutations
  const approveMutation = useApproveSeller();
  const rejectMutation = useRejectSeller();
  const deleteProductMutation = useDeleteProduct();
  const updateProductStatusMutation = useUpdateProductStatus();

  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // All actions call real API — no local state manipulation
  const handleApproveSeller = (id: string, status: "APPROVED" | "REJECTED") => {
    if (status === "APPROVED") {
      approveMutation.mutate(id, {
        onSuccess: () => showToast("✅ Seller approved"),
        onError: (e) => showToast(`❌ ${e.message}`),
      });
    } else {
      rejectMutation.mutate(id, {
        onSuccess: () => showToast("✅ Seller rejected"),
        onError: (e) => showToast(`❌ ${e.message}`),
      });
    }
  };

  const handleToggleProduct = (id: string) => {
    const p = apiProducts.find((x: any) => x.id === id);
    if (!p) return;
    const newStatus = (p as any).status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    updateProductStatusMutation.mutate(
      { productId: id, status: newStatus as any },
      {
        onSuccess: () => showToast(`Product → ${newStatus}`),
        onError: (e) => showToast(`❌ ${e.message}`),
      }
    );
  };

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id, {
      onSuccess: () => showToast("🗑️ Product removed"),
      onError: (e) => showToast(`❌ ${e.message}`),
    });
  };

  if (!user || user.role !== "ADMIN") return null;

  // Computed from real data — no hardcoded fallbacks
  const allSellers = apiUsers.filter((u: any) => u.role === "SELLER");
  const activeSellers = allSellers.filter((u: any) => u.sellerStatus === "APPROVED");
  const pendingSellers = allSellers.filter((u: any) => u.sellerStatus === "PENDING");

  const statusColor = (s: string) => {
    if (["Delivered", "Resolved", "APPROVED", "ACTIVE", "DELIVERED", "CONFIRMED"].includes(s)) return "bg-emerald-500/15 text-emerald-400";
    if (["Shipped", "IN_TRANSIT", "OUT_FOR_DELIVERY", "PACKING", "READY_TO_SHIP"].includes(s)) return "bg-blue-500/15 text-blue-400";
    if (["Processing", "In Review", "Awaiting Response", "PENDING", "PROCESSING", "PAYMENT_PENDING", "CREATED"].includes(s)) return "bg-yellow-500/15 text-yellow-400";
    if (["Cancelled", "Open", "REJECTED", "ARCHIVED", "CANCELLED", "PAYMENT_FAILED", "OPEN"].includes(s)) return "bg-red-500/15 text-red-400";
    if (["DRAFT"].includes(s)) return "bg-zinc-500/15 text-muted";
    return "bg-zinc-500/15 text-muted";
  };

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-foreground">Loading...</div>}>
      <div className="flex h-screen bg-background text-foreground font-sans">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-surface border border-border rounded-xl shadow-2xl text-[13px] font-semibold">{toast}</div>}

      <AdminSidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        signOut={signOut} pendingSellersCount={pendingSellers.length}
        productsCount={apiProducts.length} ordersCount={apiOrders.length}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background hide-scrollbar">
        <AdminTopbar setMobileMenuOpen={setMobileMenuOpen} />

        <div className="p-6 max-w-[1300px] w-full mx-auto space-y-6">
          {activeTab === "Dashboard" && (
            <AdminDashboardView setActiveTab={setActiveTab} statusColor={statusColor} />
          )}
          
          {activeTab === "Sellers" && (
            <AdminSellersView
              allSellers={allSellers} activeSellers={activeSellers} pendingSellers={pendingSellers}
              products={apiProducts as any} orders={apiOrders as any}
              handleApproveSeller={handleApproveSeller} statusColor={statusColor}
              handleToggleProduct={handleToggleProduct} handleDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === "Users" && (
            <AdminUsersView users={apiUsers as any} handleDeleteUser={() => {}} />
          )}

          {activeTab === "Products" && (
            <AdminProductsView
              products={apiProducts as any} sellerNames={[]} statusColor={statusColor}
              handleToggleProduct={handleToggleProduct} handleDeleteProduct={handleDeleteProduct}
              saveProductEdit={() => {}}
            />
          )}

          {activeTab === "Orders" && (
            <AdminOrdersView statusColor={statusColor} />
          )}

          {(activeTab === "Disputes" || activeTab === "Disputes & Chats") && (
            <AdminDisputesView />
          )}

          {activeTab === "Returns & Refunds" && <AdminReturnsView />}
          {activeTab === "Coupons & Offers" && <AdminCouponsView />}
          {activeTab === "Payouts" && <AdminPayoutsView />}
          {activeTab === "Reviews" && <AdminReviewsView />}
          {activeTab === "Marketing" && <AdminMarketingView />}
          {activeTab === "Shipping" && <AdminShippingView />}
          {activeTab === "Events" && <AdminEventsView />}
          {activeTab === "Community" && <AdminCommunityView />}
          {activeTab === "Blog & Guides" && <AdminBlogView />}
          {activeTab === "Creators" && <AdminCreatorsView />}
          {activeTab === "Garage Network" && <AdminGarageView />}
          {activeTab === "Analytics" && <AdminAnalyticsView />}
          {activeTab === "Sales Reports" && <AdminAnalyticsView />}
          {activeTab === "System Logs" && <AdminLogsView />}
          {activeTab === "Roles & Permissions" && <AdminRolesView />}
          {activeTab === "Settings" && <AdminSettingsView />}

          {/* Fallback for unknown tabs */}
          {!["Dashboard", "Sellers", "Users", "Products", "Orders", "Disputes", "Disputes & Chats", "Returns & Refunds", "Coupons & Offers", "Payouts", "Reviews", "Marketing", "Shipping", "Events", "Community", "Blog & Guides", "Creators", "Garage Network", "Analytics", "Sales Reports", "System Logs", "Roles & Permissions", "Settings"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 relative">
                <Shield className="w-12 h-12 text-red-500" />
                <div className="absolute top-0 right-0 w-6 h-6 bg-surface rounded-full flex items-center justify-center border border-border"><Check className="w-3 h-3 text-red-500" /></div>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2 uppercase text-foreground">Module Not Found</h1>
              <p className="text-muted text-[14px] max-w-[420px] leading-relaxed mb-8">
                The <span className="text-[#ff5c1a] font-bold">{activeTab}</span> module doesn&apos;t exist.
              </p>
              <button onClick={() => setActiveTab("Dashboard")} className="px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground rounded-xl text-[13px] font-bold transition flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
      </div>
    </Suspense>
  );
}
