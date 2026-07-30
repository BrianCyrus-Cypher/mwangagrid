import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Sun,
  Camera,
  Wifi,
  Network,
  Cable,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import ProductModal from "@/components/ProductModal";
import { useCart } from "@/contexts/CartContext";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

const CATEGORIES = [
  { value: "all", label: "All Products", icon: null },
  { value: "solar-equipment", label: "Solar Equipment", icon: Sun },
  { value: "cctv-cameras", label: "CCTV Cameras", icon: Camera },
  { value: "routers", label: "Routers", icon: Wifi },
  { value: "network-switches", label: "Switches", icon: Network },
  { value: "cables", label: "Cables", icon: Cable },
];

const CATEGORY_COLORS: Record<string, string> = {
  "solar-equipment":
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "cctv-cameras":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  routers:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "network-switches":
    "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300",
  cables: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

function ProductCard({
  product,
  onView,
  onAdd,
}: {
  product: any;
  onView: () => void;
  onAdd: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const catColor =
    CATEGORY_COLORS[product.category] || "bg-blue-100 text-blue-700";
  const images: string[] =
    product.images?.length > 1
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startSlideshow = useCallback(() => {
    if (images.length < 2) return;
    intervalRef.current = setInterval(
      () => setSlideIdx(i => (i + 1) % images.length),
      3000
    );
  }, [images.length]);
  const stopSlideshow = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);
  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  return (
    <Card className="overflow-hidden flex flex-col group border-0 shadow-md card-hover">
      {/* Image */}
      <div
        className="relative h-36 sm:h-48 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#0B1426] dark:to-[#1B345C] overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={onView}
        onMouseEnter={startSlideshow}
        onMouseLeave={stopSlideshow}
      >
        {images.length > 0 && !imgError ? (
          <>
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 ${i === slideIdx ? "opacity-100" : "opacity-0"}`}
                onError={() => {
                  if (i === 0) setImgError(true);
                }}
                loading="lazy"
              />
            ))}
            {images.length > 1 && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSlideIdx(i => (i - 1 + images.length) % images.length);
                  }}
                  className={`absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10 ${imgError ? "hidden" : ""}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSlideIdx(i => (i + 1) % images.length);
                  }}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10 ${imgError ? "hidden" : ""}`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === slideIdx ? "bg-accent w-3" : "bg-white/60"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <span className="text-5xl">📦</span>
        )}
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${catColor}`}
        >
          {product.category?.replace(/-/g, " ")}
        </span>
        {product.inStock === false && (
          <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
            Out of Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col min-w-0">
        <h3
          className="font-heading font-bold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-accent transition-colors leading-snug break-words"
          onClick={onView}
        >
          {product.name}
        </h3>
        <p className="text-sm text-foreground/60 mb-4 flex-1 line-clamp-2 leading-relaxed break-words">
          {product.description}
        </p>

        {/* Rating mock */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < 4 ? "fill-blue-400 text-blue-400" : "text-muted"}`}
            />
          ))}
          <span className="text-xs text-foreground/40 ml-1">(24)</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-accent">
            KES {(product.price || 0).toLocaleString()}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-foreground/40 line-through">
              KES {product.discountPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="outline"
            size="sm"
            onClick={onView}
          >
            View Details
          </Button>
          <Button
            className="flex-1"
            size="sm"
            onClick={onAdd}
            disabled={product.inStock === false}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Products() {
  const [, navigate] = useLocation();
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = trpc.products.list.useQuery();
  const showSkeleton = useDelayedLoading(isLoading, 1000);
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const perPage = 10;

  const filteredProducts = (products || [])
    .filter((p: any) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const safePage = Math.min(productPage, totalPages - 1);
  const paginatedProducts = filteredProducts.slice(
    safePage * perPage,
    (safePage + 1) * perPage
  );

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleQuickAdd = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      category: product.category,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1426] via-[#111D35] to-[#182D4A] text-white">
        <div className="container py-10 md:py-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-2 md:mb-3">
            Product Catalog
          </h1>
          <p className="text-white/70 text-lg">
            Premium solar, security, and networking solutions —{" "}
            {products?.length || 0} products available
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setProductPage(0);
              }}
              className="pl-10 h-11 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setProductPage(0);
              }}
              className="h-11 w-full sm:w-auto border border-input rounded-md px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setProductPage(0);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  active
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                    : "bg-background text-foreground/70 border-border hover:border-accent hover:text-accent"
                }`}
              >
                {CatIcon && <CatIcon className="w-4 h-4" />}
                {cat.label}
              </button>
            );
          })}
          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setProductPage(0);
              }}
              className="px-4 py-2 rounded-full text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
            >
              Clear ×
            </button>
          )}
        </div>

        {/* Results count */}
        {(searchTerm || selectedCategory !== "all") && (
          <p className="text-sm text-foreground/50 mb-6">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredProducts.length}
            </span>{" "}
            results
            {selectedCategory !== "all" && (
              <>
                {" "}
                in{" "}
                <span className="font-semibold text-accent">
                  {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                </span>
              </>
            )}
          </p>
        )}

        {/* Products Grid */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <Card className="p-16 text-center border-dashed border-2">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Products could not load
            </h3>
            <p className="text-foreground/60 mb-6">
              Please retry the catalog request.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </Card>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product: any) => (
              <div key={product.id} className="min-w-0">
                <ProductCard
                  product={product}
                  onView={() => handleViewDetails(product)}
                  onAdd={() => handleQuickAdd(product)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-dashed border-2">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-foreground/60 mb-6">
              Try adjusting your search or clearing the filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setProductPage(0);
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 px-2">
            <span className="text-sm text-foreground/40">
              Page {safePage + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductPage(safePage - 1)}
                disabled={safePage === 0}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
