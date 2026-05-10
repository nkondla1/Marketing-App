"use client";

import type { Product } from "@/lib/types";
import { effectivePrice, badgeColors } from "@/lib/utils";

interface ProductModalProps {
  product: Product | null;
  isWishlisted: boolean;
  darkMode: boolean;
  fmt: (amount: number) => string;
  copiedProductId: number | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onShare: (product: Product) => void;
}

export function ProductModal({
  product,
  isWishlisted,
  darkMode,
  fmt,
  copiedProductId,
  onClose,
  onAddToCart,
  onToggleWishlist,
  onShare,
}: ProductModalProps) {
  if (!product) return null;

  const dm = darkMode;
  const muted = dm ? "text-slate-400" : "text-slate-500";
  const card = dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${card} border`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className={`absolute right-4 top-4 rounded-full p-1 ${
            dm
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          ✕
        </button>

        {/* Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              dm ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-700"
            }`}
          >
            {product.category}
          </span>
          {product.badge && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeColors(product.badge)}`}>
              {product.badge}
            </span>
          )}
          {isWishlisted && (
            <span className="rounded-full px-3 py-1 text-xs font-bold bg-red-100 text-red-700">
              ♥ Wishlisted
            </span>
          )}
          {product.stock && product.stock <= 5 && (
            <span className="rounded-full px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700">
              Only {product.stock} left!
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold">{product.name}</h3>
        <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{product.description}</p>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-yellow-500 font-medium">★ {product.rating}</span>
          <span className={`text-xs ${muted}`}>({product.reviews} reviews)</span>
          {product.soldToday && (
            <span className="text-xs font-medium text-orange-600">
              🔥 {product.soldToday} sold today
            </span>
          )}
        </div>

        {/* Features list */}
        <div className={`mt-5 rounded-xl p-4 ${dm ? "bg-slate-700" : "bg-slate-50"}`}>
          <p className="text-sm font-semibold mb-3">What&apos;s included:</p>
          <ul className="space-y-2">
            {product.features.map((f, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 text-sm ${
                  dm ? "text-slate-300" : "text-slate-600"
                }`}
              >
                <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              {fmt(effectivePrice(product))}
            </span>
            {product.discount && (
              <span className={`ml-2 text-sm line-through ${muted}`}>
                {fmt(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 transition min-w-[120px]"
          >
            + Add to Cart
          </button>
          <button
            onClick={() => onToggleWishlist(product)}
            aria-label="Toggle wishlist"
            className={`rounded-lg border p-2.5 text-lg transition ${
              isWishlisted
                ? "border-red-300 text-red-500 hover:bg-red-50"
                : dm
                ? "border-slate-600 text-slate-500 hover:text-red-400"
                : "border-slate-200 text-slate-300 hover:text-red-400"
            }`}
          >
            ♥
          </button>
          <button
            onClick={() => onShare(product)}
            title="Share product"
            className={`rounded-lg border p-2.5 text-sm transition ${
              copiedProductId === product.id
                ? "border-green-400 text-green-600"
                : dm
                ? "border-slate-600 text-slate-400 hover:text-blue-400"
                : "border-slate-200 text-slate-400 hover:text-blue-600"
            }`}
          >
            {copiedProductId === product.id ? "✓" : "↗"}
          </button>
        </div>

        <p className={`mt-3 text-xs text-center ${muted}`}>
          30-day money-back guarantee · Instant access · Lifetime updates
        </p>
      </div>
    </div>
  );
}
