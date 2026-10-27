/**
 * Homepage data constants.
 * Extracted from page.tsx to keep components lean and data separate.
 */

import { ShieldCheck, RotateCcw, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Category Navigation ─── */
export const CATEGORIES_NAV = [
  "Helmets",
  "Riding Gear",
  "Accessories",
  "Performance",
  "Tires",
  "Luggage",
  "Maintenance",
  "Modification",
];

/* ─── Hero Slides ─── */
export interface HeroSlide {
  image: string;
  tag: string;
  title: React.ReactNode;
  cta1: string;
  cta2: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/images/hero1.png",
    tag: "India's largest motorcycle community and marketplace",
    title: (
      <>
        GEAR UP.
        <br />
        RIDE FURTHER.
      </>
    ),
    cta1: "SHOP NOW",
    cta2: "JOIN COMMUNITY",
  },
  {
    image: "/images/hero2.png",
    tag: "Adventure awaits — gear up for the open road",
    title: (
      <>
        EXPLORE.
        <br />
        DISCOVER.
        <br />
        <span className="text-[#ff5c1a]">ADVENTURE.</span>
      </>
    ),
    cta1: "SHOP NOW",
    cta2: "JOIN COMMUNITY",
  },
  {
    image: "/images/hero3.png",
    tag: "Premium gear for every rider",
    title: (
      <>
        RIDE
        <br />
        BEYOND
        <br />
        <span className="text-[#ff5c1a]">LIMITS.</span>
      </>
    ),
    cta1: "SHOP NOW",
    cta2: "JOIN COMMUNITY",
  },
];

/* ─── Trust Badges ─── */
export interface TrustBadge {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const TRUST_BADGES: TrustBadge[] = [
  { icon: ShieldCheck, title: "100% Genuine Products", desc: "Authentic · Quality · Trusted" },
  { icon: RotateCcw, title: "Easy Returns", desc: "Hassle free returns" },
  { icon: Lock, title: "Secure Payments", desc: "100% secure checkout" },
  { icon: ShieldCheck, title: "Buyer Protection", desc: "We've got your back" },
];

/* ─── Bike Models ─── */
export const BIKE_MODELS = [
  { name: "Royal Enfield Classic 350", img: "/images/bike_classic350.png" },
  { name: "Royal Enfield Himalayan 450", img: "/images/bike_himalayan450.png" },
  { name: "KTM Duke 390", img: "/images/bike_duke390.png" },
  { name: "Yamaha R15 V4", img: "/images/bike_r15v4.png" },
  { name: "Pulsar NS200", img: "/images/bike_pulsarns200.png" },
  { name: "TVS Apache RTR 160", img: "/images/bike_apache160.png" },
  { name: "Honda CB350", img: "/images/bike_cb350.png" },
];

/* ─── Manufacturer → Model Mapping (for bike cascade selector) ─── */
export const BIKE_CATALOG: Record<string, string[]> = {
  "Royal Enfield": ["Classic 350", "Himalayan 450", "Hunter 350", "Meteor 350", "Continental GT 650", "Interceptor 650"],
  KTM: ["Duke 200", "Duke 390", "RC 390", "Adventure 250", "Adventure 390"],
  Yamaha: ["R15 V4", "MT-15", "FZ-S Fi", "Aerox 155", "R7"],
  Honda: ["CB350", "Hornet 2.0", "CB300R", "Unicorn 160", "SP125"],
  TVS: ["Apache RTR 160", "Apache RTR 200", "Apache RR 310", "Raider 125", "Jupiter 125"],
  Bajaj: ["Pulsar NS200", "Pulsar RS200", "Dominar 400", "Avenger 220", "Pulsar 150"],
};

/* ─── Shop Categories ─── */
export const SHOP_CATEGORIES = [
  { name: "Helmets", img: "/images/cat_helmets.png" },
  { name: "Racing Gear", img: "/images/cat_racinggear.png" },
  { name: "Accessories", img: "/images/cat_accessories.png" },
  { name: "Performance", img: "/images/cat_performance.png" },
  { name: "Tires", img: "/images/cat_tires.png" },
  { name: "Luggage", img: "/images/cat_luggage.png" },
  { name: "Maintenance", img: "/images/cat_maintenance.png" },
  { name: "Electronics", img: "/images/cat_electronics.png" },
];

/* ─── Trending Products ─── */
export const TRENDING_PRODUCTS = [
  { name: "SMK Typhoon Graphic Helmet", price: 4299, mrp: 5999, discount: "28% OFF", rating: 4.8, reviews: 126, img: "/images/prod_helmet_smk.png", seller: "MotoMagix" },
  { name: "Sarkraft Original Crash Guard", price: 3179, mrp: 4499, discount: "27% OFF", rating: 4.7, reviews: 88, img: "/images/prod_crash_guard.png", seller: "TrailWorks" },
  { name: "ROLON Chain Kit 43M Coster", price: 1799, mrp: 2499, discount: "31% OFF", rating: 4.6, reviews: 214, img: "/images/prod_chain_kit.png", seller: "MotoMagix" },
  { name: "HJC LED Fog Light (Set of 2)", price: 1799, mrp: 2399, discount: "25% OFF", rating: 4.5, reviews: 67, img: "/images/prod_fog_light.png", seller: "Nomad Gear" },
  { name: "Viaterra Claw Tail Bag 2L", price: 3899, mrp: 4999, discount: "22% OFF", rating: 4.9, reviews: 357, img: "/images/prod_tail_bag.png", seller: "Viaterra" },
  { name: "Motul 7100 4T 10W-40 Engine Oil", price: 1299, mrp: 1599, discount: "19% OFF", rating: 4.7, reviews: 142, img: "/images/cat_maintenance.png", seller: "MotoMagix" },
];

/* ─── Community Posts ─── */
export const COMMUNITY_POSTS = [
  { author: "RiderBeast", title: "Ladakh 2024 on Himalayan 450", body: "30 riding days of pure joy. This machine was a game changer.", likes: 113, comments: 36, img: "/images/bike_himalayan450.png" },
  { author: "BrontoWanderer", title: "Best exhaust for Duke 390?", body: "I'm going for a superbike vibe and sound. Currently looking at Arrow vs SC Project.", likes: 19, comments: 92, img: "/images/bike_duke390.png" },
  { author: "Roamer03", title: "Weekend ride to Tumkur Ghat", body: "Amazing curves, great scenery...small community ride with friends.", likes: 45, comments: 12, img: "/images/hero1.png" },
  { author: "MotoMaxR1", title: "My new setup for touring", body: "Finally upgraded my Luggage setup. Premium quality gear!", likes: 19, comments: 21, img: "/images/hero2.png" },
];

/* ─── Brands ─── */
export const BRANDS = ["AXR", "SMK", "VIATERRA", "SARKRAFT", "MOTUL", "BOBO", "HJC", "LK WORKS", "ORION"];

/* ─── Creator Videos ─── */
export const CREATOR_VIDEOS = [
  { title: "Himalayan 450 Long Term Review — 5000kms Later", creator: "RideWithRaj", views: "12K", duration: "12:45", img: "/images/bike_himalayan450.png" },
  { title: "Top 10 Accessories I Regret Not Buying Sooner!", creator: "MotoMagnet", views: "8.5K", duration: "10:32", img: "/images/cat_accessories.png" },
  { title: "Ladakh 2024 on Pulsar NS200", creator: "TwoWheelTales", views: "6.2K", duration: "18:20", img: "/images/bike_pulsarns200.png" },
  { title: "How I Modified My Classic 350", creator: "RetroRider", views: "15K", duration: "11:55", img: "/images/bike_classic350.png" },
  { title: "R15 V4 Top Speed & Performance Test", creator: "SpeedFreak", views: "22K", duration: "9:47", img: "/images/bike_r15v4.png" },
];

/* ─── Year options for bike selector ─── */
export const YEAR_OPTIONS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i,
);
