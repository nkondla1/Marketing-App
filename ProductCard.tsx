"use client";

import type { Product } from "@/lib/types";
import { effectivePrice, badgeColors } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  isInCompare: boolean;
  loyaltyPoints: number;
  darkMode: boolean;
  fmt: (amount: number) => string;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (id: number) => void;
  onOpenProduct: (product: Product) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  isInCompare,
  loyaltyPoints,
  darkMode,
  fmt,
  onAddToCart,
  onToggleWishlist,
  onToggleCompare,
  onOpenProduct,
}: ProductCardProps) {
  const dm = darkMode;
  const muted = dm ? "text-slate-400" : "text-slate-500";

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
        isWishlisted
          ? dm
            ? "border-yellow-600/50 bg-yellow-900/20"
            : "border-yellow-300 bg-yellow-50/60"
          : dm
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            {product.badge && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeColors(product.badge)}`}>
                {product.badge}
              </span>
            )}
            {product.stock && product.stock <= 5 && (
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-700">
                Only {product.stock} left!
              </span>
            )}
          </div>
          <button
            onClick={() => onOpenProduct(product)}
            className={`block text-left text-base font-semibold leading-snug hover:text-blue-600 transition ${
              dm ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {product.name}
          </button>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {product.discount && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              -{product.discount}%
            </span>
          )}
          <button
            onClick={() => onToggleWishlist(product)}
            aria-label="Toggle wishlist"
            className={`text-xl leading-none transition ${
              isWishlisted
                ? "text-red-500 hover:text-red-600"
                : dm
                ? "text-slate-600 hover:text-red-400"
                : "text-slate-200 hover:text-red-400"
            }`}
          >
            ♥
          </button>
        </div>
      </div>

      <p className={`mt-2 text-sm line-clamp-2 ${muted}`}>{product.description}</p>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-yellow-500 text-sm">★ {product.rating}</span>
        <span className={`text-xs ${muted}`}>({product.reviews})</span>
        {product.soldToday && (
          <span className="text-xs font-medium text-orange-600">
            🔥 {product.soldToday} sold today
          </span>
        )}
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-xs ${
            dm ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
          }`}
        >
          {product.category}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-blue-600 text-xl">{fmt(effectivePrice(product))}</span>
          {product.discount && (
            <span className={`text-xs line-through ${muted}`}>{fmt(product.price)}</span>
          )}
          {loyaltyPoints === 0 && (
            <span className={`text-xs ${dm ? "text-amber-400" : "text-amber-600"}`}>
              +{Math.floor(effectivePrice(product))} pts
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition"
          >
            + Add to Cart
          </button>
          <button
            onClick={() => onToggleCompare(product.id)}
            title="Compare"
            className={`rounded-md border px-3 py-2 text-sm transition ${
              isInCompare
                ? "border-purple-500 bg-purple-100 text-purple-700"
                : dm
                ? "border-slate-600 text-slate-400 hover:border-purple-400"
                : "border-slate-200 text-slate-400 hover:border-purple-400"
            }`}
          >
            ⇄
          </button>
        </div>
        <button
          onClick={() => onOpenProduct(product)}
          className={`w-full text-xs text-center hover:underline ${
            dm ? "text-blue-400" : "text-blue-600"
          }`}
        >
          View details & features →
        </button>
      </div>
    </article>
  );
}
