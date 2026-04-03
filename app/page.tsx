"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import pptxgen from "pptxgenjs";

// ── Types ─────────────────────────────────────────────────────────────────────

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  discount?: number;
  badge?: "Bestseller" | "New" | "Popular" | "Hot";
  features: string[];
  stock?: number;
  soldToday?: number;
};

type CartItem = Product & { quantity: number };
type SortOption = "default" | "price-asc" | "price-desc" | "rating-desc" | "reviews-desc";
type Toast = { id: number; message: string; type: "success" | "error" | "info" };
type Currency = "USD" | "EUR" | "GBP";
type CheckoutStep = "idle" | "address" | "review" | "confirmed";
type Address = { name: string; email: string; company: string; country: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const RATES: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79 };
const SYMBOLS: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£" };
const MAX_PRICE = 299;
const FREE_DELIVERY_THRESHOLD = 150;
const OFFER_END = new Date("2026-04-01T00:00:00");
const FLASH_END = new Date("2026-03-28T23:59:00");

// ── Data ──────────────────────────────────────────────────────────────────────

const products: Product[] = [
  {
    id: 1,
    name: "Growth Marketing Playbook",
    description: "Complete guide with case studies, frameworks, and step-by-step strategies for scaling from 0 to 7 figures.",
    price: 49,
    category: "Guide",
    rating: 4.8,
    reviews: 142,
    discount: 20,
    badge: "Bestseller",
    soldToday: 8,
    features: [
      "50+ real-world case studies",
      "Proven growth frameworks",
      "Step-by-step campaign blueprints",
      "KPI tracking spreadsheet templates",
      "Lifetime access + free updates",
    ],
  },
  {
    id: 2,
    name: "Content Funnel Blueprint",
    description: "Pre-designed templates and email sequences to drive conversions at every stage of the funnel.",
    price: 75,
    category: "Template",
    rating: 4.9,
    reviews: 98,
    features: [
      "20 battle-tested email sequence templates",
      "Landing page wireframe library",
      "Conversion rate optimization checklist",
      "A/B testing framework & tracker",
      "Figma + Google Docs formats included",
    ],
  },
  {
    id: 3,
    name: "Marketing Automation Toolkit",
    description: "Ready-to-use workflows, ad creatives, and dashboards to reclaim 10+ hours every week.",
    price: 99,
    category: "Toolkit",
    rating: 4.7,
    reviews: 201,
    badge: "Popular",
    soldToday: 12,
    features: [
      "15 plug-and-play automation workflows",
      "100+ ad creative assets (Canva ready)",
      "Analytics dashboard for 5 platforms",
      "Integration guides for 20+ tools",
      "Slack & email alert setup scripts",
    ],
  },
  {
    id: 4,
    name: "Quarterly Growth Audit",
    description: "Expert 1-on-1 analysis with competitive insights and a custom actionable roadmap.",
    price: 299,
    category: "Service",
    rating: 5.0,
    reviews: 45,
    stock: 3,
    features: [
      "90-minute 1-on-1 strategy session",
      "Full competitive landscape analysis",
      "Custom quarterly growth roadmap",
      "30-day priority email follow-up",
      "Session recording + written summary",
    ],
  },
  {
    id: 5,
    name: "Social Media Calendar Bundle",
    description: "6-month fully planned content calendar with design briefs, hashtag research, and Canva templates.",
    price: 39,
    category: "Template",
    rating: 4.6,
    reviews: 87,
    badge: "New",
    features: [
      "6-month multi-platform content calendar",
      "Platform-specific post templates (IG, LI, X, TikTok)",
      "Design brief library (50+ briefs)",
      "Hashtag research & trend reports",
      "Canva template pack (editable)",
    ],
  },
  {
    id: 6,
    name: "Email Marketing Masterclass",
    description: "12-hour video course covering segmentation, copywriting, deliverability, and optimization.",
    price: 129,
    category: "Guide",
    rating: 4.9,
    reviews: 156,
    badge: "Hot",
    discount: 20,
    soldToday: 6,
    features: [
      "12 hours of HD video content",
      "Advanced segmentation strategy guide",
      "60+ plug-and-play copy templates",
      "Deliverability optimization checklist",
      "Certificate of completion",
    ],
  },
];

const testimonials = [
  { name: "Sarah Chen", role: "Marketing Director", company: "TechFlow", content: "This toolkit cut our campaign setup time in half. The automation workflows alone are worth 10x the price.", rating: 5 },
  { name: "James Rodriguez", role: "Startup Founder", company: "ScaleUp Inc.", content: "The growth playbook gave us the exact framework we needed to scale from $0 to $500k MRR.", rating: 5 },
  { name: "Emily Thompson", role: "Content Manager", company: "ContentCo", content: "Professional templates that actually convert. Our email open rates jumped from 18% to 34% in a month.", rating: 5 },
  { name: "Michael Park", role: "VP Marketing", company: "GrowthBridge", content: "The quarterly audit was a game-changer. Our CAC dropped by 40% after implementing the roadmap.", rating: 5 },
];

const bundles = [
  { id: "starter", name: "Starter Bundle", tagline: "Perfect for solo marketers getting started", productIds: [1, 5], discount: 15 },
  { id: "pro", name: "Pro Bundle", tagline: "Everything you need to run campaigns like a pro", productIds: [2, 3, 6], discount: 20 },
  { id: "agency", name: "Agency Bundle", tagline: "Full stack for agencies managing multiple clients", productIds: [1, 2, 3, 6], discount: 25 },
];

const faqs = [
  { q: "Do I get lifetime access to digital products?", a: "Yes! All guides, templates, and toolkits include lifetime access plus free future updates at no extra cost." },
  { q: "What formats are the templates provided in?", a: "Templates come in multiple formats — Google Docs/Sheets, Notion, Figma, and Canva — whichever fits your workflow." },
  { q: "Is there a refund policy?", a: "Absolutely. We offer a 30-day money-back guarantee on all digital products, no questions asked." },
  { q: "How do I access my purchases after checkout?", a: "You'll receive an email with download links and access credentials within 5 minutes of your order being placed." },
  { q: "Can I use these resources for client work?", a: "Yes — a single-user license covers all your client projects. Team licenses for 5+ seats are available on request." },
  { q: "Do you offer team or enterprise pricing?", a: "Yes! Contact us for custom pricing for teams of 5 or more, or for enterprise use cases with volume discounts." },
];

const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  SAVE10: { discount: 10, label: "10% off your order" },
  WELCOME20: { discount: 20, label: "20% welcome discount" },
  BUNDLE15: { discount: 15, label: "15% bundle discount" },
};

const flashSaleItems = [
  { productId: 2, flashPrice: 49, label: "33% off today only" },
  { productId: 3, flashPrice: 65, label: "34% off today only" },
];

const articles = [
  {
    category: "Growth Strategy",
    title: "The $0–$1M Marketing Playbook: What Works in 2026",
    excerpt: "We analyzed 500 high-growth companies to identify the exact moves that drove their first million in revenue.",
    readTime: "8 min read",
    date: "Mar 20",
  },
  {
    category: "Email Marketing",
    title: "Why Your Email Open Rates Are Declining (And How to Fix It)",
    excerpt: "iOS privacy changes crushed vanity metrics. Here's how to measure and optimize email performance the right way.",
    readTime: "6 min read",
    date: "Mar 14",
  },
  {
    category: "Automation",
    title: "5 Automations Every Marketing Team Should Set Up This Week",
    excerpt: "These set-and-forget workflows save MarketHub customers an average of 12 hours per week.",
    readTime: "5 min read",
    date: "Mar 8",
  },
];

const pressLogos = ["TechCrunch", "Forbes", "Entrepreneur", "Marketing Week", "Inc.", "Wired"];

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "Singapore", "Brazil", "Netherlands", "Other"];

// ── PowerPoint Export ──────────────────────────────────────────────────────────

function buildPptx(wishlist: Set<number>) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";

  const cover = pptx.addSlide();
  cover.background = { color: "1D4ED8" };
  cover.addText("📈 MarketHub", { x: 1, y: 1.0, w: 8, h: 1, fontSize: 48, bold: true, color: "FFFFFF", align: "center" });
  cover.addText("Premium Marketing Resources & Services", { x: 1, y: 2.3, w: 8, h: 0.6, fontSize: 20, color: "BFDBFE", align: "center" });
  cover.addText("Scale Your Marketing Strategy", { x: 2, y: 3.1, w: 6, h: 0.5, fontSize: 15, color: "E0F2FE", align: "center", italic: true });
  [{ v: "1,200+", l: "Customers Served" }, { v: "4.8 ★", l: "Average Rating" }, { v: "$10M+", l: "Revenue Generated" }].forEach((s, i) => {
    const x = 0.8 + i * 3.2;
    cover.addShape(pptx.ShapeType.roundRect, { x, y: 4.0, w: 2.8, h: 1.1, fill: { color: "1E40AF" }, line: { color: "3B82F6", width: 1 } });
    cover.addText(s.v, { x, y: 4.06, w: 2.8, h: 0.55, fontSize: 22, bold: true, color: "FFFFFF", align: "center" });
    cover.addText(s.l, { x, y: 4.56, w: 2.8, h: 0.4, fontSize: 11, color: "BFDBFE", align: "center" });
  });

  const overview = pptx.addSlide();
  overview.background = { color: "F8FAFC" };
  overview.addText("Product Catalog", { x: 0.5, y: 0.3, w: 9, h: 0.7, fontSize: 28, bold: true, color: "1E293B" });
  overview.addText(`${products.length} products · ${new Set(products.map((p) => p.category)).size} categories`, { x: 0.5, y: 0.9, w: 9, h: 0.4, fontSize: 14, color: "64748B" });
  products.forEach((product, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.3 + col * 3.3, y = 1.55 + row * 2.3;
    const ep = product.price * (1 - (product.discount || 0) / 100);
    const wl = wishlist.has(product.id);
    overview.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.0, h: 2.0, fill: { color: wl ? "FEF3C7" : "FFFFFF" }, line: { color: wl ? "F59E0B" : "E2E8F0", width: 1 } });
    if (product.discount) {
      overview.addShape(pptx.ShapeType.roundRect, { x: x + 2.3, y: y + 0.05, w: 0.6, h: 0.28, fill: { color: "FEE2E2" }, line: { color: "FCA5A5", width: 0 } });
      overview.addText(`-${product.discount}%`, { x: x + 2.3, y: y + 0.05, w: 0.6, h: 0.28, fontSize: 8, bold: true, color: "DC2626", align: "center" });
    }
    overview.addText(product.name, { x: x + 0.1, y: y + 0.1, w: 2.1, h: 0.45, fontSize: 10, bold: true, color: "1E293B", wrap: true });
    overview.addText(product.description.slice(0, 90) + "…", { x: x + 0.1, y: y + 0.55, w: 2.8, h: 0.65, fontSize: 8, color: "475569", wrap: true });
    overview.addText(`★ ${product.rating}  (${product.reviews})`, { x: x + 0.1, y: y + 1.22, w: 2.8, h: 0.28, fontSize: 8, color: "D97706" });
    overview.addText(`$${ep.toFixed(0)}`, { x: x + 0.1, y: y + 1.55, w: 1.2, h: 0.35, fontSize: 14, bold: true, color: "2563EB" });
    overview.addText(product.category, { x: x + 1.8, y: y + 1.62, w: 1.1, h: 0.28, fontSize: 8, color: "6D28D9", align: "right" });
  });

  products.forEach((product) => {
    const slide = pptx.addSlide();
    const ep = product.price * (1 - (product.discount || 0) / 100);
    slide.background = { color: "FFFFFF" };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 5.63, fill: { color: "2563EB" } });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 0.28, w: 1.4, h: 0.38, fill: { color: "EFF6FF" }, line: { color: "BFDBFE", width: 1 } });
    slide.addText(product.category, { x: 0.5, y: 0.28, w: 1.4, h: 0.38, fontSize: 10, color: "2563EB", bold: true, align: "center" });
    if (product.badge) {
      const bc = product.badge === "Bestseller" ? { bg: "FEF3C7", text: "92400E" } : product.badge === "New" ? { bg: "DCFCE7", text: "166534" } : { bg: "EFF6FF", text: "1E40AF" };
      slide.addShape(pptx.ShapeType.roundRect, { x: 2.1, y: 0.28, w: 1.2, h: 0.38, fill: { color: bc.bg }, line: { color: bc.bg, width: 0 } });
      slide.addText(product.badge, { x: 2.1, y: 0.28, w: 1.2, h: 0.38, fontSize: 9, color: bc.text, bold: true, align: "center" });
    }
    if (wishlist.has(product.id)) slide.addText("♥ Wishlisted", { x: 3.5, y: 0.32, w: 1.5, h: 0.3, fontSize: 10, color: "E11D48", bold: true });
    slide.addText(product.name, { x: 0.5, y: 0.85, w: 9, h: 0.8, fontSize: 28, bold: true, color: "0F172A" });
    slide.addText(product.description, { x: 0.5, y: 1.8, w: 6.5, h: 0.9, fontSize: 13, color: "475569", wrap: true });
    slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 2.8, w: 9, h: 0, line: { color: "E2E8F0", width: 1 } });
    slide.addText("What's included:", { x: 0.5, y: 2.95, w: 4, h: 0.3, fontSize: 11, bold: true, color: "374151" });
    product.features.forEach((f, i) => {
      slide.addText(`✓  ${f}`, { x: 0.5, y: 3.3 + i * 0.33, w: 5.5, h: 0.3, fontSize: 10, color: "374151" });
    });
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 3.0, w: 2.6, h: 1.3, fill: { color: "EFF6FF" }, line: { color: "BFDBFE", width: 1 } });
    slide.addText("Price", { x: 6.8, y: 3.1, w: 2.6, h: 0.3, fontSize: 11, color: "64748B", align: "center" });
    slide.addText(`$${ep.toFixed(0)}`, { x: 6.8, y: 3.38, w: 2.6, h: 0.6, fontSize: 36, bold: true, color: "2563EB", align: "center" });
    if (product.discount) slide.addText(`was $${product.price}  (${product.discount}% off)`, { x: 6.8, y: 3.95, w: 2.6, h: 0.28, fontSize: 9, color: "94A3B8", align: "center" });
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 4.45, w: 2.6, h: 1.0, fill: { color: "FFFBEB" }, line: { color: "FDE68A", width: 1 } });
    slide.addText(`${product.rating} ★`, { x: 6.8, y: 4.55, w: 2.6, h: 0.55, fontSize: 28, bold: true, color: "D97706", align: "center" });
    slide.addText(`${product.reviews} reviews`, { x: 6.8, y: 5.07, w: 2.6, h: 0.28, fontSize: 10, color: "94A3B8", align: "center" });
  });

  const tSlide = pptx.addSlide();
  tSlide.background = { color: "F0F9FF" };
  tSlide.addText("Loved by Marketing Teams", { x: 0.5, y: 0.25, w: 9, h: 0.7, fontSize: 26, bold: true, color: "1E293B", align: "center" });
  testimonials.forEach((t, i) => {
    const x = 0.25 + (i % 2) * 4.9, y = 1.2 + Math.floor(i / 2) * 2.2;
    tSlide.addShape(pptx.ShapeType.roundRect, { x, y, w: 4.6, h: 2.0, fill: { color: "FFFFFF" }, line: { color: "E0F2FE", width: 1 } });
    tSlide.addText("★".repeat(t.rating), { x, y: y + 0.12, w: 4.6, h: 0.38, fontSize: 16, color: "F59E0B", align: "center" });
    tSlide.addText(`"${t.content}"`, { x: x + 0.2, y: y + 0.55, w: 4.2, h: 0.85, fontSize: 10, color: "334155", wrap: true, italic: true });
    tSlide.addText(t.name, { x: x + 0.2, y: y + 1.48, w: 2.5, h: 0.28, fontSize: 11, bold: true, color: "0F172A" });
    tSlide.addText(`${t.role} · ${t.company}`, { x: x + 0.2, y: y + 1.72, w: 4.0, h: 0.22, fontSize: 9, color: "64748B" });
  });

  if (wishlist.size > 0) {
    const wlSlide = pptx.addSlide();
    wlSlide.background = { color: "FFFBEB" };
    wlSlide.addText("My Wishlist", { x: 0.5, y: 0.3, w: 9, h: 0.7, fontSize: 28, bold: true, color: "92400E" });
    wlSlide.addText(`${wishlist.size} saved item${wishlist.size !== 1 ? "s" : ""}`, { x: 0.5, y: 0.95, w: 9, h: 0.35, fontSize: 14, color: "B45309" });
    const wishlisted = products.filter((p) => wishlist.has(p.id));
    wishlisted.forEach((p, i) => {
      const y = 1.55 + i * 0.82;
      const ep = p.price * (1 - (p.discount || 0) / 100);
      wlSlide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y, w: 9, h: 0.7, fill: { color: "FFFFFF" }, line: { color: "FDE68A", width: 1 } });
      wlSlide.addText(p.name, { x: 0.7, y: y + 0.07, w: 5.5, h: 0.33, fontSize: 12, bold: true, color: "1E293B" });
      wlSlide.addText(p.category, { x: 0.7, y: y + 0.38, w: 2.5, h: 0.24, fontSize: 9, color: "6D28D9" });
      wlSlide.addText(`$${ep.toFixed(0)}`, { x: 7.5, y: y + 0.1, w: 1.8, h: 0.45, fontSize: 18, bold: true, color: "2563EB", align: "right" });
    });
    const wTotal = wishlisted.reduce((s, p) => s + p.price * (1 - (p.discount || 0) / 100), 0);
    const ty = 1.55 + wishlisted.length * 0.82 + 0.15;
    wlSlide.addShape(pptx.ShapeType.line, { x: 0.5, y: ty, w: 9, h: 0, line: { color: "FCD34D", width: 1 } });
    wlSlide.addText(`Wishlist Total: $${wTotal.toFixed(2)}`, { x: 0.5, y: ty + 0.15, w: 9, h: 0.5, fontSize: 16, bold: true, color: "92400E", align: "right" });
  }

  pptx.writeFile({ fileName: "MarketHub-Catalog.pptx" });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function effectivePrice(p: Product) {
  return p.price * (1 - (p.discount || 0) / 100);
}

function badgeColors(badge: Product["badge"]) {
  switch (badge) {
    case "Bestseller": return "bg-yellow-100 text-yellow-800";
    case "New": return "bg-green-100 text-green-800";
    case "Hot": return "bg-red-100 text-red-800";
    default: return "bg-blue-100 text-blue-800";
  }
}

function generateOrderId() {
  return "MH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [maxPriceFilter, setMaxPriceFilter] = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);

  // Modals
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Checkout
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("idle");
  const [address, setAddress] = useState<Address>({ name: "", email: "", company: "", country: "" });
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Promo / coupon
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  // Newsletter
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Misc
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [flashTimeLeft, setFlashTimeLeft] = useState({ hrs: 0, mins: 0, secs: 0 });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copiedProductId, setCopiedProductId] = useState<number | null>(null);

  // ── LocalStorage ──
  useEffect(() => {
    setMounted(true);
    try {
      const c = localStorage.getItem("mh_cart");
      const w = localStorage.getItem("mh_wishlist");
      const d = localStorage.getItem("mh_dark");
      const cur = localStorage.getItem("mh_currency");
      const pts = localStorage.getItem("mh_points");
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(new Set(JSON.parse(w)));
      if (d) setDarkMode(d === "1");
      if (cur && ["USD", "EUR", "GBP"].includes(cur)) setCurrency(cur as Currency);
      if (pts) setLoyaltyPoints(Number(pts));
    } catch {}
  }, []);

  useEffect(() => { if (mounted) localStorage.setItem("mh_cart", JSON.stringify(cart)); }, [cart, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem("mh_wishlist", JSON.stringify([...wishlist])); }, [wishlist, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem("mh_dark", darkMode ? "1" : "0"); }, [darkMode, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem("mh_currency", currency); }, [currency, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem("mh_points", String(loyaltyPoints)); }, [loyaltyPoints, mounted]);

  // ── Countdown timers ──
  useEffect(() => {
    const tick = () => {
      const diff = OFFER_END.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = FLASH_END.getTime() - Date.now();
      if (diff <= 0) return;
      setFlashTimeLeft({ hrs: Math.floor(diff / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Scroll / keyboard ──
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setActiveProduct(null); setShowCompare(false); if (checkoutStep !== "confirmed") setCheckoutStep("idle"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [checkoutStep]);

  // ── Toast ──
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Price formatter (currency-aware) ──
  const fmt = useCallback((usdAmount: number) => {
    const converted = usdAmount * RATES[currency];
    return `${SYMBOLS[currency]}${Math.round(converted)}`;
  }, [currency]);

  // ── Cart handlers ──
  const handleAddToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    addToast(`"${product.name}" added to cart`);
  }, [addToast]);

  const handleRemoveItem = (id: number) => setCart((prev) => prev.filter((item) => item.id !== id));

  const handleChangeQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.flatMap((item) => {
      if (item.id !== id) return [item];
      const next = item.quantity + delta;
      return next < 1 ? [] : [{ ...item, quantity: next }];
    }));
  };

  // ── Wishlist ──
  const handleToggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) { next.delete(product.id); addToast("Removed from wishlist", "info"); }
      else { next.add(product.id); addToast(`"${product.name}" saved to wishlist`); }
      return next;
    });
  }, [addToast]);

  // ── Product modal ──
  const handleOpenProduct = useCallback((product: Product) => {
    setActiveProduct(product);
    setRecentlyViewed((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 4));
  }, []);

  // ── Compare ──
  const handleToggleCompare = (id: number) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) { addToast("Select up to 2 products to compare", "error"); return prev; }
      return [...prev, id];
    });
  };

  // ── Coupon ──
  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedCode(code);
      setCouponError("");
      addToast(`Coupon applied — ${PROMO_CODES[code].label}!`);
    } else {
      setCouponError("Invalid code. Try SAVE10, WELCOME20, or BUNDLE15");
      addToast("Invalid coupon code", "error");
    }
  };

  // ── Flash deal ──
  const handleAddFlashDeal = (productId: number, flashPrice: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const flashProduct = { ...product, price: flashPrice, discount: undefined };
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...flashProduct, quantity: 1 }];
    });
    addToast(`⚡ Flash deal! "${product.name}" added to cart`);
  };

  // ── Bundle ──
  const handleAddBundle = (bundle: typeof bundles[0]) => {
    bundle.productIds.forEach((pid) => {
      const p = products.find((x) => x.id === pid);
      if (p) {
        setCart((prev) => {
          const existing = prev.find((item) => item.id === p.id);
          if (existing) return prev.map((item) => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
          return [...prev, { ...p, quantity: 1 }];
        });
      }
    });
    addToast(`"${bundle.name}" added to cart!`);
  };

  // ── Checkout ──
  const handleConfirmOrder = () => {
    const num = generateOrderId();
    const pts = Math.floor(total);
    setOrderNumber(num);
    setCheckoutStep("confirmed");
    setLoyaltyPoints((prev) => prev + pts);
    setCart([]);
    setAppliedCode(null);
    setCoupon("");
    addToast(`Order confirmed! +${pts} loyalty points earned 🎉`);
  };

  // ── Share product ──
  const handleShareProduct = (product: Product) => {
    const text = `Check out "${product.name}" — ${fmt(effectivePrice(product))} | MarketHub`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedProductId(product.id);
      addToast("Link copied to clipboard!");
      setTimeout(() => setCopiedProductId(null), 2000);
    }).catch(() => addToast("Could not copy to clipboard", "error"));
  };

  // ── Newsletter ──
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); addToast("Subscribed! Welcome email on its way."); setEmail(""); }
  };

  // ── Computed ──
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), []);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = !selectedCategory || p.category === selectedCategory;
      const matchPrice = effectivePrice(p) <= maxPriceFilter;
      const matchRating = minRating === 0 || p.rating >= minRating;
      return matchSearch && matchCat && matchPrice && matchRating;
    });
    if (sortOption === "price-asc") list = [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    else if (sortOption === "price-desc") list = [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    else if (sortOption === "rating-desc") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortOption === "reviews-desc") list = [...list].sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [searchQuery, selectedCategory, sortOption, maxPriceFilter, minRating]);

  const subtotal = useMemo(() => cart.reduce((s, item) => s + effectivePrice(item) * item.quantity, 0), [cart]);
  const productSavings = useMemo(() => cart.reduce((s, item) => s + item.price * item.quantity * (item.discount || 0) / 100, 0), [cart]);
  const couponDiscount = appliedCode ? subtotal * PROMO_CODES[appliedCode].discount / 100 : 0;
  const total = subtotal - couponDiscount;

  const recentProducts = useMemo(() => recentlyViewed.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[], [recentlyViewed]);
  const compareProducts = useMemo(() => compareList.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[], [compareList]);

  // ── Style shortcuts ──
  const dm = darkMode;
  const bg = dm ? "bg-slate-900 text-slate-100" : "bg-gradient-to-b from-slate-950 via-blue-50 to-indigo-50 text-slate-900";
  const card = dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const input = dm ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400" : "bg-white border-slate-300 text-slate-900";
  const muted = dm ? "text-slate-400" : "text-slate-500";

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ── Toasts ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-xl text-sm font-medium text-white max-w-xs pointer-events-auto ${t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"}`}>
            <span className="shrink-0">{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── Back to top ── */}
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition">
          ↑ Top
        </button>
      )}

      {/* ── Product Detail Modal ── */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveProduct(null)}>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${card} border`} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveProduct(null)} aria-label="Close"
              className={`absolute right-4 top-4 rounded-full p-1 ${dm ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}>✕</button>
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${dm ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-700"}`}>{activeProduct.category}</span>
              {activeProduct.badge && <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeColors(activeProduct.badge)}`}>{activeProduct.badge}</span>}
              {wishlist.has(activeProduct.id) && <span className="rounded-full px-3 py-1 text-xs font-bold bg-red-100 text-red-700">♥ Wishlisted</span>}
              {activeProduct.stock && activeProduct.stock <= 5 && (
                <span className="rounded-full px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700">Only {activeProduct.stock} left!</span>
              )}
            </div>
            <h3 className="text-2xl font-bold">{activeProduct.name}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{activeProduct.description}</p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="text-yellow-500 font-medium">★ {activeProduct.rating}</span>
              <span className={`text-xs ${muted}`}>({activeProduct.reviews} reviews)</span>
              {activeProduct.soldToday && <span className="text-xs font-medium text-orange-600">🔥 {activeProduct.soldToday} sold today</span>}
            </div>
            <div className={`mt-5 rounded-xl p-4 ${dm ? "bg-slate-700" : "bg-slate-50"}`}>
              <p className="text-sm font-semibold mb-3">What&apos;s included:</p>
              <ul className="space-y-2">
                {activeProduct.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${dm ? "text-slate-300" : "text-slate-600"}`}>
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <div>
                <span className="text-2xl font-bold text-blue-600">{fmt(effectivePrice(activeProduct))}</span>
                {activeProduct.discount && <span className={`ml-2 text-sm line-through ${muted}`}>{fmt(activeProduct.price)}</span>}
              </div>
              <button onClick={() => { handleAddToCart(activeProduct); setActiveProduct(null); }}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 transition min-w-[120px]">
                + Add to Cart
              </button>
              <button onClick={() => handleToggleWishlist(activeProduct)} aria-label="Toggle wishlist"
                className={`rounded-lg border p-2.5 text-lg transition ${wishlist.has(activeProduct.id) ? "border-red-300 text-red-500 hover:bg-red-50" : dm ? "border-slate-600 text-slate-500 hover:text-red-400" : "border-slate-200 text-slate-300 hover:text-red-400"}`}>
                ♥
              </button>
              <button onClick={() => handleShareProduct(activeProduct)} title="Share product"
                className={`rounded-lg border p-2.5 text-sm transition ${copiedProductId === activeProduct.id ? "border-green-400 text-green-600" : dm ? "border-slate-600 text-slate-400 hover:text-blue-400" : "border-slate-200 text-slate-400 hover:text-blue-600"}`}>
                {copiedProductId === activeProduct.id ? "✓" : "↗"}
              </button>
            </div>
            <p className={`mt-3 text-xs text-center ${muted}`}>30-day money-back guarantee · Instant access · Lifetime updates</p>
          </div>
        </div>
      )}

      {/* ── Compare Modal ── */}
      {showCompare && compareProducts.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCompare(false)}>
          <div className={`relative w-full max-w-3xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${card} border`} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCompare(false)} aria-label="Close"
              className={`absolute right-4 top-4 rounded-full p-1 ${dm ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"}`}>✕</button>
            <h3 className="text-xl font-bold mb-6">Side-by-Side Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              {compareProducts.map((p) => (
                <div key={p.id} className={`rounded-xl border p-4 ${dm ? "border-slate-600 bg-slate-700" : "border-slate-200 bg-slate-50"}`}>
                  {p.badge && <span className={`inline-block mb-2 rounded-full px-2 py-0.5 text-xs font-bold ${badgeColors(p.badge)}`}>{p.badge}</span>}
                  <h4 className="font-bold text-base mb-1">{p.name}</h4>
                  <p className={`text-xs mb-3 ${muted}`}>{p.description}</p>
                  <div className="text-xl font-bold text-blue-600 mb-1">
                    {fmt(effectivePrice(p))}
                    {p.discount && <span className={`ml-2 text-sm font-normal line-through ${muted}`}>{fmt(p.price)}</span>}
                  </div>
                  <div className="text-sm text-yellow-500 mb-3">★ {p.rating} <span className={`text-xs ${muted}`}>({p.reviews})</span></div>
                  <ul className="space-y-1 mb-4">
                    {p.features.map((f, i) => (
                      <li key={i} className={`flex gap-2 text-xs ${dm ? "text-slate-300" : "text-slate-600"}`}><span className="text-green-500 shrink-0">✓</span>{f}</li>
                    ))}
                  </ul>
                  <button onClick={() => { handleAddToCart(p); setShowCompare(false); setCompareList([]); }}
                    className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ── */}
      {checkoutStep !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => checkoutStep !== "confirmed" && setCheckoutStep("idle")}>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${card} border`} onClick={(e) => e.stopPropagation()}>
            {checkoutStep !== "confirmed" && (
              <button onClick={() => setCheckoutStep("idle")} aria-label="Close"
                className={`absolute right-4 top-4 rounded-full p-1 ${dm ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"}`}>✕</button>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-6">
              {[["1", "Address"], ["2", "Review"], ["✓", "Done"]].map(([num, label], i) => {
                const isDone = (checkoutStep === "review" && i === 0) || (checkoutStep === "confirmed" && i <= 1);
                const isActive = (checkoutStep === "address" && i === 0) || (checkoutStep === "review" && i === 1) || (checkoutStep === "confirmed" && i === 2);
                return (
                  <div key={label} className="flex items-center gap-1 flex-1">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDone ? "text-green-600" : isActive ? "text-blue-600" : muted}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? "bg-green-100 text-green-700" : isActive ? "bg-blue-100 text-blue-700" : dm ? "bg-slate-700 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
                        {isDone ? "✓" : num}
                      </span>
                      {label}
                    </div>
                    {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${isDone ? "bg-green-300" : dm ? "bg-slate-700" : "bg-slate-200"}`} />}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Address */}
            {checkoutStep === "address" && (
              <form onSubmit={(e) => { e.preventDefault(); setCheckoutStep("review"); }}>
                <h3 className="text-xl font-bold mb-4">Delivery Information</h3>
                <div className="space-y-3">
                  {([
                    { key: "name", label: "Full Name", type: "text", placeholder: "Jane Smith", required: true },
                    { key: "email", label: "Email Address", type: "email", placeholder: "jane@company.com", required: true },
                    { key: "company", label: "Company (optional)", type: "text", placeholder: "Acme Corp", required: false },
                  ] as const).map(({ key, label, type, placeholder, required }) => (
                    <div key={key}>
                      <label className={`text-xs font-semibold ${muted}`}>{label}</label>
                      <input type={type} required={required} value={address[key]}
                        onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${input}`} />
                    </div>
                  ))}
                  <div>
                    <label className={`text-xs font-semibold ${muted}`}>Country</label>
                    <select required value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                      className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${input}`}>
                      <option value="">Select country…</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setCheckoutStep("idle")}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${dm ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                    Cancel
                  </button>
                  <button type="submit" className="flex-[2] rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">
                    Review Order →
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Review */}
            {checkoutStep === "review" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Review Your Order</h3>
                <div className={`rounded-xl p-4 mb-4 space-y-2 ${dm ? "bg-slate-700" : "bg-slate-50"}`}>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className={dm ? "text-slate-300" : "text-slate-700"}>{item.name} × {item.quantity}</span>
                      <span className="font-semibold">{fmt(effectivePrice(item) * item.quantity)}</span>
                    </div>
                  ))}
                  {couponDiscount > 0 && (
                    <div className={`flex justify-between text-sm text-green-600 border-t pt-2 mt-1 ${dm ? "border-slate-600" : "border-slate-200"}`}>
                      <span>Coupon ({appliedCode})</span>
                      <span>−{fmt(couponDiscount)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between font-bold text-base border-t pt-2 mt-1 ${dm ? "border-slate-600" : "border-slate-200"}`}>
                    <span>Total</span>
                    <span className="text-blue-600">{fmt(total)}</span>
                  </div>
                </div>
                <div className={`rounded-xl p-4 mb-6 text-sm ${dm ? "bg-slate-700" : "bg-slate-50"}`}>
                  <p className="font-semibold mb-2">Delivering to:</p>
                  <p className={dm ? "text-slate-200" : "text-slate-800"}>{address.name}</p>
                  <p className={muted}>{address.email}</p>
                  {address.company && <p className={muted}>{address.company}</p>}
                  <p className={muted}>{address.country}</p>
                </div>
                <div className={`rounded-xl p-3 mb-4 text-xs ${dm ? "bg-blue-900/30 text-blue-300" : "bg-blue-50 text-blue-700"}`}>
                  ⭐ You&apos;ll earn <strong>{Math.floor(total)} loyalty points</strong> on this order!
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCheckoutStep("address")}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${dm ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                    ← Back
                  </button>
                  <button onClick={handleConfirmOrder}
                    className="flex-[2] rounded-lg bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
                    Confirm & Pay {fmt(total)} →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmed */}
            {checkoutStep === "confirmed" && (
              <div className="text-center py-2">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
                <p className={`text-sm mb-5 ${muted}`}>
                  Thank you, <strong>{address.name.split(" ")[0]}</strong>! Download links sent to <strong>{address.email}</strong>.
                </p>
                <div className={`rounded-xl p-4 mb-4 ${dm ? "bg-slate-700" : "bg-slate-50"}`}>
                  <p className={`text-xs mb-1 ${muted}`}>Order Reference</p>
                  <p className="text-lg font-bold font-mono text-blue-600">{orderNumber}</p>
                </div>
                <div className={`rounded-xl p-4 mb-5 text-left ${dm ? "bg-green-900/30 border border-green-800" : "bg-green-50 border border-green-200"}`}>
                  <p className="font-semibold text-sm text-green-700 mb-1">⭐ Loyalty Points Earned</p>
                  <p className={`text-sm ${dm ? "text-green-400" : "text-green-600"}`}>+{Math.floor(total)} points added</p>
                  <p className={`text-xs mt-0.5 ${muted}`}>Your total: {loyaltyPoints} pts — redeemable on next order</p>
                </div>
                <button onClick={() => setCheckoutStep("idle")}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition">
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className={`sticky top-0 z-40 border-b ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} shadow-sm`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 gap-3 flex-wrap">
          <div className="shrink-0">
            <h1 className="text-2xl font-bold tracking-tight text-blue-600">📈 MarketHub</h1>
            <p className={`text-xs ${muted}`}>Premium marketing resources & services</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Currency switcher */}
            <div className={`flex rounded-lg border text-xs font-semibold overflow-hidden ${dm ? "border-slate-600" : "border-slate-200"}`}>
              {(["USD", "EUR", "GBP"] as Currency[]).map((c) => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1.5 transition ${currency === c ? "bg-blue-600 text-white" : dm ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Loyalty points */}
            {loyaltyPoints > 0 && (
              <div className={`rounded-full px-3 py-1.5 text-xs font-semibold ${dm ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                ⭐ {loyaltyPoints} pts
              </div>
            )}

            <button onClick={() => setDarkMode((d) => !d)} aria-label="Toggle dark mode"
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${dm ? "bg-slate-700 text-yellow-400 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              {dm ? "☀" : "🌙"}
            </button>
            <button onClick={() => { buildPptx(wishlist); addToast("PowerPoint exported!"); }}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
              ⬇ PPT
            </button>
            {wishlist.size > 0 && (
              <div className={`rounded-full px-3 py-2 text-sm font-medium ${dm ? "bg-slate-700 text-yellow-400" : "bg-yellow-50 text-yellow-700"}`}>
                ♥ {wishlist.size}
              </div>
            )}
            {compareList.length > 0 && (
              <button onClick={() => compareList.length === 2 ? setShowCompare(true) : addToast("Select one more product to compare", "info")}
                className="rounded-full bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200 transition">
                ⇄ {compareList.length}/2{compareList.length === 2 ? " →" : ""}
              </button>
            )}
            <div className={`rounded-full px-3 py-2 text-sm font-medium ${dm ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-700"}`}>
              🛒 {cart.reduce((s, i) => s + i.quantity, 0)}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-16 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold mb-4">
            🚀 Trusted by 1,200+ marketing professionals
          </div>
          <h2 className="text-4xl font-bold leading-tight sm:text-5xl max-w-2xl">Scale Your Marketing Strategy</h2>
          <p className="mt-4 max-w-xl text-lg text-blue-100">
            Battle-tested playbooks, templates, and tools from marketing leaders. Save 100+ hours and drive measurable growth.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white/20 border border-white/30 px-5 py-3 flex-wrap">
            <span className="text-sm font-semibold">⏱ March deal ends in:</span>
            {([["days", timeLeft.days], ["hrs", timeLeft.hours], ["min", timeLeft.mins], ["sec", timeLeft.secs]] as [string, number][]).map(([l, v]) => (
              <div key={l} className="text-center">
                <div className="rounded bg-white/30 px-2 py-1 text-xl font-bold tabular-nums min-w-[2.8rem] text-center">{String(v).padStart(2, "0")}</div>
                <div className="text-xs text-blue-200 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50 transition">Explore Products</button>
            <button onClick={() => document.getElementById("flash-sale")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-lg border-2 border-orange-300 bg-orange-400/20 px-6 py-3 font-semibold text-white hover:bg-orange-400/40 transition">⚡ Flash Sale</button>
            <button onClick={() => document.getElementById("bundles")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white hover:bg-blue-600 transition">Bundle Deals</button>
            <button onClick={() => { buildPptx(wishlist); addToast("PowerPoint exported!"); }}
              className="rounded-lg bg-orange-400 px-6 py-3 font-semibold text-white hover:bg-orange-500 transition">⬇ Export PPT</button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[["1,200+", "Customers served"], ["4.8★", "Average rating"], ["$10M+", "Revenue generated"]].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-white/15 border border-white/20 p-4">
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-sm text-blue-100">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo Banner ── */}
      <div className={`px-6 py-3 text-center sm:px-10 ${dm ? "bg-orange-950 border-b border-orange-900" : "bg-orange-50"}`}>
        <p className={`text-sm font-semibold ${dm ? "text-orange-300" : "text-orange-800"}`}>
          🔥 Use code{" "}
          {["WELCOME20", "SAVE10", "BUNDLE15"].map((c, i, arr) => (
            <span key={c}>
              <span className={`rounded px-1.5 py-0.5 font-mono text-xs ${dm ? "bg-orange-800" : "bg-orange-100"}`}>{c}</span>
              {i < arr.length - 1 ? " · " : ""}
            </span>
          ))}{" "}
          for up to 20% off!
        </p>
      </div>

      {/* ── Flash Sale ── */}
      <section id="flash-sale" className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <span className="inline-block rounded bg-white/20 px-2 py-0.5 text-xs font-bold text-white mb-1">⚡ FLASH SALE</span>
              <h3 className="text-2xl font-bold text-white">Today Only Deals</h3>
            </div>
            <div className="flex items-center gap-2 text-white text-sm flex-wrap">
              <span className="text-orange-100">Ends in:</span>
              {([["hrs", flashTimeLeft.hrs], ["min", flashTimeLeft.mins], ["sec", flashTimeLeft.secs]] as [string, number][]).map(([l, v]) => (
                <div key={l} className="text-center">
                  <div className="rounded bg-white/20 px-2 py-1 text-lg font-bold tabular-nums min-w-[2.2rem] text-center">{String(v).padStart(2, "0")}</div>
                  <div className="text-xs text-orange-200 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {flashSaleItems.map(({ productId, flashPrice, label }) => {
              const p = products.find((x) => x.id === productId)!;
              const regular = effectivePrice(p);
              const savePct = Math.round((1 - flashPrice / regular) * 100);
              return (
                <div key={productId} className="rounded-xl bg-white/15 border border-white/25 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold mb-2 ${badgeColors(p.badge)}`}>{p.badge}</span>
                    <h4 className="font-bold text-white text-base">{p.name}</h4>
                    <p className="text-sm text-orange-100 mt-1 line-clamp-2">{p.description}</p>
                    <p className="text-xs text-orange-200 mt-1">{label}</p>
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <span className="text-2xl font-bold text-white">{fmt(flashPrice)}</span>
                      <span className="text-sm line-through text-orange-200">{fmt(regular)}</span>
                      <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold text-white">−{savePct}%</span>
                    </div>
                  </div>
                  <button onClick={() => handleAddFlashDeal(productId, flashPrice)}
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition shrink-0">
                    Grab Deal ⚡
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* ── Recently Viewed ── */}
        {recentProducts.length > 0 && (
          <section className="mt-8">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${muted}`}>Recently Viewed</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentProducts.map((p) => (
                <button key={p.id} onClick={() => handleOpenProduct(p)}
                  className={`shrink-0 rounded-lg border px-4 py-2 text-sm hover:border-blue-400 transition text-left ${dm ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                  <span className="font-medium">{p.name}</span>
                  <span className={`ml-2 text-xs ${muted}`}>{fmt(effectivePrice(p))}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Search / Filter / Sort ── */}
        <section className="mt-8 space-y-4">
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${muted}`}>🔍</span>
            <input type="text" placeholder="Search products…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 pl-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${input}`} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${muted} hover:text-red-500`}>✕</button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === null ? "bg-blue-600 text-white" : dm ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === cat ? "bg-blue-600 text-white" : dm ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                {cat} ({products.filter((p) => p.category === cat).length})
              </button>
            ))}
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium shrink-0 ${muted}`}>Min rating:</span>
            {[{ v: 0, l: "Any" }, { v: 4.5, l: "4.5★+" }, { v: 4.7, l: "4.7★+" }, { v: 4.9, l: "4.9★+" }].map(({ v, l }) => (
              <button key={v} onClick={() => setMinRating(v)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${minRating === v ? "bg-yellow-500 text-white" : dm ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <label className={`text-sm font-medium shrink-0 ${muted}`}>Sort:</label>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)}
                className={`rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none ${input}`}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="reviews-desc">Most Reviewed</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className={`text-sm font-medium whitespace-nowrap ${muted}`}>
                Max: <span className="font-bold text-blue-600">{fmt(maxPriceFilter)}</span>
              </label>
              <input type="range" min={0} max={MAX_PRICE} step={5} value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))} className="w-36 accent-blue-600" />
              {maxPriceFilter < MAX_PRICE && (
                <button onClick={() => setMaxPriceFilter(MAX_PRICE)} className={`text-xs hover:text-blue-600 ${muted}`}>Reset</button>
              )}
            </div>
          </div>

          {compareList.length > 0 && (
            <div className={`flex flex-wrap items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${dm ? "bg-purple-900/40 text-purple-300" : "bg-purple-50 text-purple-700"}`}>
              <span className="font-medium">⇄ Comparing:</span>
              {compareList.map((id) => (
                <span key={id} className={`rounded-full px-2 py-0.5 text-xs ${dm ? "bg-purple-800 text-purple-200" : "bg-purple-100 text-purple-700"}`}>
                  {products.find((p) => p.id === id)?.name}
                </span>
              ))}
              {compareList.length === 2 && (
                <button onClick={() => setShowCompare(true)} className="ml-1 text-xs font-semibold underline">View comparison</button>
              )}
              <button onClick={() => setCompareList([])} className={`ml-auto text-xs ${muted} hover:text-red-500`}>Clear</button>
            </div>
          )}
        </section>

        {/* ── Products Grid + Cart ── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* Products */}
          <section className="lg:col-span-2" id="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {filteredProducts.length} Product{filteredProducts.length !== 1 ? "s" : ""}
                {wishlist.size > 0 && <span className={`ml-3 text-sm font-normal ${dm ? "text-yellow-400" : "text-yellow-600"}`}>♥ {wishlist.size} saved</span>}
              </h2>
              {(searchQuery || selectedCategory || maxPriceFilter < MAX_PRICE || sortOption !== "default" || minRating > 0) && (
                <button onClick={() => { setSearchQuery(""); setSelectedCategory(null); setMaxPriceFilter(MAX_PRICE); setSortOption("default"); setMinRating(0); }}
                  className="text-xs text-blue-600 hover:underline">Clear all filters</button>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <article key={product.id}
                  className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${wishlist.has(product.id)
                    ? dm ? "border-yellow-600/50 bg-yellow-900/20" : "border-yellow-300 bg-yellow-50/60"
                    : dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-1.5 flex-wrap mb-1.5">
                        {product.badge && (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeColors(product.badge)}`}>{product.badge}</span>
                        )}
                        {product.stock && product.stock <= 5 && (
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-700">Only {product.stock} left!</span>
                        )}
                      </div>
                      <button onClick={() => handleOpenProduct(product)}
                        className={`block text-left text-base font-semibold leading-snug hover:text-blue-600 transition ${dm ? "text-slate-100" : "text-slate-900"}`}>
                        {product.name}
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {product.discount && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">-{product.discount}%</span>}
                      <button onClick={() => handleToggleWishlist(product)} aria-label="Toggle wishlist"
                        className={`text-xl leading-none transition ${wishlist.has(product.id) ? "text-red-500 hover:text-red-600" : dm ? "text-slate-600 hover:text-red-400" : "text-slate-200 hover:text-red-400"}`}>
                        ♥
                      </button>
                    </div>
                  </div>

                  <p className={`mt-2 text-sm line-clamp-2 ${muted}`}>{product.description}</p>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-yellow-500 text-sm">★ {product.rating}</span>
                    <span className={`text-xs ${muted}`}>({product.reviews})</span>
                    {product.soldToday && (
                      <span className="text-xs font-medium text-orange-600">🔥 {product.soldToday} sold today</span>
                    )}
                    <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs ${dm ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{product.category}</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-blue-600 text-xl">{fmt(effectivePrice(product))}</span>
                      {product.discount && <span className={`text-xs line-through ${muted}`}>{fmt(product.price)}</span>}
                      {loyaltyPoints === 0 && <span className={`text-xs ${dm ? "text-amber-400" : "text-amber-600"}`}>+{Math.floor(effectivePrice(product))} pts</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddToCart(product)}
                        className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition">
                        + Add to Cart
                      </button>
                      <button onClick={() => handleToggleCompare(product.id)} title="Compare"
                        className={`rounded-md border px-3 py-2 text-sm transition ${compareList.includes(product.id) ? "border-purple-500 bg-purple-100 text-purple-700" : dm ? "border-slate-600 text-slate-400 hover:border-purple-400" : "border-slate-200 text-slate-400 hover:border-purple-400"}`}>
                        ⇄
                      </button>
                    </div>
                    <button onClick={() => handleOpenProduct(product)}
                      className={`w-full text-xs text-center hover:underline ${dm ? "text-blue-400" : "text-blue-600"}`}>
                      View details & features →
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className={`rounded-xl border-2 border-dashed p-12 text-center ${dm ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-base font-medium ${muted}`}>No products match your filters.</p>
                <button onClick={() => { setSearchQuery(""); setSelectedCategory(null); setMaxPriceFilter(MAX_PRICE); setSortOption("default"); setMinRating(0); }}
                  className="mt-3 text-sm text-blue-600 hover:underline">Clear all filters</button>
              </div>
            )}
          </section>

          {/* ── Sidebar ── */}
          <aside className="lg:sticky lg:top-20 lg:h-fit space-y-4">

            {wishlist.size > 0 && (
              <div className={`rounded-xl border p-4 ${dm ? "bg-yellow-950/30 border-yellow-800" : "bg-yellow-50 border-yellow-200"}`}>
                <h2 className={`text-sm font-bold mb-3 ${dm ? "text-yellow-400" : "text-yellow-800"}`}>♥ Wishlist ({wishlist.size})</h2>
                <div className="space-y-2">
                  {products.filter((p) => wishlist.has(p.id)).map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <span className={`truncate flex-1 ${dm ? "text-slate-300" : "text-slate-700"}`}>{p.name}</span>
                      <span className="font-semibold text-blue-600 shrink-0 text-xs">{fmt(effectivePrice(p))}</span>
                      <button onClick={() => handleAddToCart(p)} className="shrink-0 rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700">+Cart</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart */}
            <div className={`rounded-xl border p-5 shadow-sm ${card}`}>
              <h2 className="text-lg font-bold mb-1">🛒 Cart</h2>

              {cart.length === 0 ? (
                <p className={`mt-4 text-sm text-center py-4 ${muted}`}>Your cart is empty.</p>
              ) : (
                <>
                  <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className={`rounded-lg border p-3 ${dm ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-100"}`}>
                        <div className="flex justify-between gap-1">
                          <p className={`font-medium text-xs leading-snug flex-1 ${dm ? "text-slate-200" : "text-slate-800"}`}>{item.name}</p>
                          <button onClick={() => handleRemoveItem(item.id)} aria-label="Remove" className="text-red-400 hover:text-red-600 text-xs shrink-0">✕</button>
                        </div>
                        <p className={`text-xs mt-0.5 ${muted}`}>{fmt(effectivePrice(item))} each</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <button onClick={() => handleChangeQuantity(item.id, -1)} className={`rounded border w-6 h-6 text-xs font-bold flex items-center justify-center ${dm ? "border-slate-500 text-slate-300" : "border-slate-300"}`}>−</button>
                          <span className={`text-xs w-5 text-center font-semibold ${dm ? "text-slate-200" : ""}`}>{item.quantity}</span>
                          <button onClick={() => handleChangeQuantity(item.id, 1)} className={`rounded border w-6 h-6 text-xs font-bold flex items-center justify-center ${dm ? "border-slate-500 text-slate-300" : "border-slate-300"}`}>+</button>
                          <span className={`ml-auto text-xs font-medium ${dm ? "text-slate-300" : "text-slate-600"}`}>{fmt(effectivePrice(item) * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    {subtotal < FREE_DELIVERY_THRESHOLD ? (
                      <>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={muted}>Free delivery at {fmt(FREE_DELIVERY_THRESHOLD)}</span>
                          <span className="text-blue-600 font-medium">{fmt(FREE_DELIVERY_THRESHOLD - subtotal)} away</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full ${dm ? "bg-slate-700" : "bg-slate-200"}`}>
                          <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
                        </div>
                      </>
                    ) : (
                      <div className={`rounded-lg px-3 py-2 text-xs font-medium ${dm ? "bg-green-900/40 text-green-400" : "bg-green-50 text-green-700 border border-green-200"}`}>
                        🎉 You qualify for free delivery!
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Promo code…" value={coupon}
                        onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 ${input}`} />
                      <button onClick={handleApplyCoupon} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Apply</button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                    {appliedCode && <p className="text-xs text-green-600 mt-1">✓ {appliedCode} — {PROMO_CODES[appliedCode].label}!</p>}
                  </div>

                  <div className={`mt-4 space-y-1.5 border-t pt-4 ${dm ? "border-slate-700" : "border-slate-100"}`}>
                    <div className="flex justify-between text-sm">
                      <span className={muted}>Subtotal</span>
                      <span>{fmt(subtotal)}</span>
                    </div>
                    {productSavings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discounts</span>
                        <span className="text-green-600">−{fmt(productSavings)}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Coupon ({PROMO_CODES[appliedCode!].discount}%)</span>
                        <span className="text-green-600">−{fmt(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-sm font-medium ${muted}`}>Total</span>
                      <span className="text-2xl font-bold text-blue-600">{fmt(total)}</span>
                    </div>
                    {(productSavings + couponDiscount) > 0 && (
                      <p className="text-xs text-green-600 text-right">You save {fmt(productSavings + couponDiscount)}!</p>
                    )}
                    <p className={`text-xs ${dm ? "text-amber-400" : "text-amber-600"}`}>⭐ Earn {Math.floor(total)} loyalty points on this order</p>
                  </div>
                </>
              )}

              <div className="mt-4 space-y-2">
                <button disabled={cart.length === 0}
                  onClick={() => setCheckoutStep("address")}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 transition">
                  {cart.length === 0 ? "Cart Empty" : `Checkout — ${fmt(total)}`}
                </button>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])}
                    className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition ${dm ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* ── Bundle Deals ── */}
        <section id="bundles" className="mt-16">
          <h2 className="text-3xl font-bold mb-1">Bundle Deals</h2>
          <p className={`mb-8 ${muted}`}>Buy together and save more</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {bundles.map((bundle) => {
              const bProducts = bundle.productIds.map((id) => products.find((p) => p.id === id)!);
              const origTotal = bProducts.reduce((s, p) => s + effectivePrice(p), 0);
              const bundleTotal = origTotal * (1 - bundle.discount / 100);
              return (
                <div key={bundle.id} className={`rounded-xl border p-5 shadow-sm flex flex-col ${card}`}>
                  <span className="inline-block rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-bold mb-3 self-start">Save {bundle.discount}%</span>
                  <h3 className="text-lg font-bold">{bundle.name}</h3>
                  <p className={`text-sm mt-1 mb-4 ${muted}`}>{bundle.tagline}</p>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {bProducts.map((p) => (
                      <li key={p.id} className={`flex items-center gap-2 text-sm ${dm ? "text-slate-300" : "text-slate-600"}`}>
                        <span className="text-green-500 shrink-0">✓</span>{p.name}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{fmt(bundleTotal)}</span>
                    <span className={`text-sm line-through ${muted}`}>{fmt(origTotal)}</span>
                    <span className="text-xs text-green-600 font-medium">Save {fmt(origTotal - bundleTotal)}</span>
                  </div>
                  <button onClick={() => handleAddBundle(bundle)}
                    className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 transition">
                    Add Bundle to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className={`mt-16 rounded-xl p-8 sm:p-10 ${dm ? "bg-slate-800" : "bg-gradient-to-r from-blue-50 to-indigo-50"}`}>
          <h2 className="text-3xl font-bold mb-2 text-center">Loved by Marketing Teams</h2>
          <p className={`text-center mb-8 ${muted}`}>Join 1,200+ professionals already growing with MarketHub</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <div key={i} className={`rounded-xl p-5 border ${card}`}>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-500 text-sm">★</span>)}
                </div>
                <p className={`text-xs font-semibold mb-3 ${dm ? "text-blue-400" : "text-blue-600"}`}>{t.company}</p>
                <p className={`text-sm leading-relaxed mb-4 ${dm ? "text-slate-300" : "text-slate-700"}`}>&quot;{t.content}&quot;</p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className={`text-xs ${muted}`}>{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Press / Featured In ── */}
        <section className="mt-12">
          <p className={`text-xs font-semibold uppercase tracking-widest text-center mb-5 ${muted}`}>Featured In</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {pressLogos.map((logo) => (
              <span key={logo} className={`text-lg font-bold tracking-tight ${dm ? "text-slate-500 hover:text-slate-300" : "text-slate-300 hover:text-slate-500"} transition cursor-default`}>
                {logo}
              </span>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mt-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h2>
          <p className={`text-center mb-8 ${muted}`}>Everything you need to know before you buy</p>
          <div className="max-w-2xl mx-auto space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-xl border overflow-hidden ${dm ? "border-slate-700" : "border-slate-200"}`}>
                <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left font-medium text-sm ${dm ? "text-slate-200 hover:bg-slate-800" : "text-slate-800 hover:bg-slate-50"}`}>
                  <span>{faq.q}</span>
                  <span className={`ml-3 shrink-0 text-lg font-light transition-transform duration-200 ${openFAQ === i ? "rotate-45" : ""} ${muted}`}>+</span>
                </button>
                {openFAQ === i && (
                  <div className={`px-5 pb-4 text-sm leading-relaxed ${dm ? "text-slate-400 bg-slate-800/50" : "text-slate-600 bg-slate-50"}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Blog Preview ── */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">From the Blog</h2>
              <p className={`mt-1 ${muted}`}>Free marketing insights from our team</p>
            </div>
            <button className={`text-sm font-medium text-blue-600 hover:underline ${dm ? "text-blue-400" : ""}`}>View all →</button>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {articles.map((a, i) => (
              <div key={i} className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition cursor-pointer ${card}`}>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3 ${dm ? "bg-blue-900/50 text-blue-400" : "bg-blue-50 text-blue-700"}`}>{a.category}</span>
                <h3 className={`font-bold text-base leading-snug mb-2 ${dm ? "text-slate-100" : "text-slate-900"}`}>{a.title}</h3>
                <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${muted}`}>{a.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${muted}`}>{a.date} · {a.readTime}</span>
                  <span className="text-xs font-medium text-blue-600 hover:underline">Read →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="mt-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-8 sm:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Get Marketing Tips Weekly</h2>
          <p className="mb-6 text-purple-100 max-w-md mx-auto">Join 5,000+ marketers getting actionable strategies, templates, and growth hacks delivered free every week.</p>
          {subscribed ? (
            <div className="inline-block rounded-xl bg-white/20 border border-white/30 px-8 py-5">
              <p className="text-xl font-bold">🎉 You&apos;re subscribed!</p>
              <p className="text-sm text-purple-100 mt-1">Check your inbox for a welcome email with a free resource.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSignup} className="flex flex-col gap-3 sm:flex-row sm:justify-center max-w-sm mx-auto">
              <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="flex-1 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-300" />
              <button type="submit" className="rounded-lg bg-white px-6 py-3 font-semibold text-purple-700 hover:bg-purple-50 transition whitespace-nowrap">
                Subscribe Free
              </button>
            </form>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={`border-t px-6 py-12 sm:px-10 ${dm ? "bg-slate-950 border-slate-800 text-slate-500" : "bg-slate-900 border-slate-700 text-slate-400"}`}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-4 mb-10">
            <div>
              <h3 className="font-bold text-white mb-3 text-lg">📈 MarketHub</h3>
              <p className="text-sm leading-relaxed">Premium marketing resources for growth-focused professionals worldwide.</p>
              {loyaltyPoints > 0 && (
                <div className="mt-3 inline-block rounded-lg bg-amber-900/30 border border-amber-800 px-3 py-1.5 text-xs text-amber-400">
                  ⭐ {loyaltyPoints} loyalty points
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#products" className="hover:text-white transition">All Products</a></li>
                <li><a href="#flash-sale" className="hover:text-white transition">⚡ Flash Sale</a></li>
                <li><a href="#bundles" className="hover:text-white transition">Bundle Deals</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Affiliates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className={`border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm ${dm ? "border-slate-800" : "border-slate-700"}`}>
            <p>&copy; 2026 MarketHub. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => setDarkMode((d) => !d)} className="hover:text-white transition">{dm ? "☀ Light" : "🌙 Dark"}</button>
              <button onClick={() => { buildPptx(wishlist); addToast("PowerPoint exported!"); }} className="hover:text-white transition">⬇ Export PPT</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
