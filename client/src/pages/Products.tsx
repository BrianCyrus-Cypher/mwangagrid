import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Search, ShoppingCart, SlidersHorizontal, Star, Sun, Camera, Wifi, Network, Cable } from "lucide-react";
import { useState } from "react";
import ProductModal from "@/components/ProductModal";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { value: "all", label: "All Products", icon: null },
  { value: "solar-equipment", label: "Solar Equipment", icon: Sun },
  { value: "cctv-cameras", label: "CCTV Cameras", icon: Camera },
  { value: "routers", label: "Routers", icon: Wifi },
  { value: "network-switches", label: "Switches", icon: Network },
  { value: "cables", label: "Cables", icon: Cable },
];

const CATEGORY_COLORS: Record<string, string> = {
  "solar-equipment": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "cctv-cameras": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "routers": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "network-switches": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "cables": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

function ProductCard({ product, onView, onAdd }: { product: any; onView: () => void; onAdd: () => void }) {
  const [imgError, setImgError] = useState(false);
  const catColor = CATEGORY_COLORS[product.category] || "bg-slate-100 text-slate-700";

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group border-0 shadow-md">
      {/* Image */}
      <div
        className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={onView}
      >
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-5xl">📦</span>
        )}
        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${catColor}`}>
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
          className="font-bold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-accent transition-colors leading-snug break-words"
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
            <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
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
          <Button className="flex-1" variant="outline" size="sm" onClick={onView}>
            View Details
          </Button>
          <Button className="flex-1" size="sm" onClick={onAdd} disabled={product.inStock === false}>
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
  const { data: products, isLoading, isError, refetch } = trpc.products.list.useQuery();
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredProducts = (products || [])
    .filter((p: any) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

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
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Product Catalog</h1>
          <p className="text-white/70 text-lg">
            Premium solar, security, and networking solutions — {products?.length || 0} products available
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 border border-input rounded-md px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  active
                    ? "bg-accent text-white border-accent shadow-md shadow-accent/30"
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
              onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
              className="px-4 py-2 rounded-full text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
            >
              Clear ×
            </button>
          )}
        </div>

        {/* Results count */}
        {(searchTerm || selectedCategory !== "all") && (
          <p className="text-sm text-foreground/50 mb-6">
            Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> results
            {selectedCategory !== "all" && <> in <span className="font-semibold text-accent">{CATEGORIES.find(c => c.value === selectedCategory)?.label}</span></>}
          </p>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-border/70">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="space-y-4 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="p-16 text-center border-dashed border-2">
            <h3 className="text-xl font-bold text-foreground mb-2">Products could not load</h3>
            <p className="text-foreground/60 mb-6">Please retry the catalog request.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </Card>
        ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
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
            <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
            <p className="text-foreground/60 mb-6">Try adjusting your search or clearing the filters.</p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      <ProductModal product={selectedProduct} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
