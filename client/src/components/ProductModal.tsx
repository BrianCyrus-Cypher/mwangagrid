import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import {
  Star,
  ShoppingCart,
  Package,
  CheckCircle,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

interface ProductModalProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;
    images?: string[];
    inStock?: boolean;
    specifications?: string | Record<string, string>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_REVIEWS = [
  {
    author: "John K.",
    rating: 5,
    text: "Excellent product.",
    date: "2 weeks ago",
  },
  {
    author: "Sarah M.",
    rating: 5,
    text: "Great quality and fast delivery.",
    date: "1 month ago",
  },
  {
    author: "Peter N.",
    rating: 4,
    text: "Good value for money.",
    date: "1 month ago",
  },
  {
    author: "Alice J.",
    rating: 5,
    text: "Best purchase I've made.",
    date: "2 months ago",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  "solar-equipment": "Solar Equipment",
  "cctv-cameras": "CCTV Cameras",
  routers: "Routers",
  "network-switches": "Network Switches",
  cables: "Cables",
};

export default function ProductModal({
  product,
  open,
  onOpenChange,
}: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(
    (dir: number) => {
      setActiveImg(i => {
        if (!product) return i;
        const imgs = product.images?.length
          ? product.images
          : product.imageUrl
            ? [product.imageUrl]
            : [];
        return (i + dir + Math.max(imgs.length, 1)) % Math.max(imgs.length, 1);
      });
    },
    [product]
  );

  const allImages: string[] =
    (product &&
      (product.images?.length
        ? product.images
        : product.imageUrl
          ? [product.imageUrl]
          : [])) ||
    [];

  useEffect(() => {
    if (!open || !product || autoplayPaused || allImages.length < 2) return;
    intervalRef.current = setInterval(() => advance(1), 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, autoplayPaused, advance, allImages.length, product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: allImages[0] || product.imageUrl,
      category: product.category,
    });
    onOpenChange(false);
    setQuantity(1);
  };

  const totalPrice = product.price * quantity;
  const avgRating = (
    MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length
  ).toFixed(1);

  let specs: Record<string, string> = {};
  if (product.specifications) {
    if (typeof product.specifications === "string") {
      try {
        specs = JSON.parse(product.specifications);
      } catch {
        specs = {};
      }
    } else {
      specs = product.specifications;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        onOpenChange(v);
        if (!v) {
          setImgError(false);
          setActiveImg(0);
          setQuantity(1);
          setAutoplayPaused(false);
        }
      }}
    >
      <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="bg-muted/30 p-4 sm:p-5 md:p-6 flex flex-col gap-3">
            {allImages.length > 0 && !imgError ? (
              <>
                <div
                  className="relative aspect-square rounded-2xl bg-background overflow-hidden flex items-center justify-center group"
                  onTouchStart={e => {
                    touchStartX.current = e.touches[0].clientX;
                    setAutoplayPaused(true);
                  }}
                  onTouchEnd={e => {
                    const diff =
                      e.changedTouches[0].clientX - touchStartX.current;
                    if (Math.abs(diff) > 50) advance(diff > 0 ? -1 : 1);
                    setTimeout(() => setAutoplayPaused(false), 5000);
                  }}
                  onMouseEnter={() => setAutoplayPaused(true)}
                  onMouseLeave={() => setAutoplayPaused(false)}
                >
                  {allImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={product.name}
                      className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 ${i === activeImg ? "opacity-100" : "opacity-0"}`}
                      onError={() => {
                        if (i === 0) setImgError(true);
                      }}
                      loading="lazy"
                    />
                  ))}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          advance(-1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          advance(1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={e => {
                              e.stopPropagation();
                              setActiveImg(i);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? "bg-accent w-4" : "bg-white/70 hover:bg-white"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {allImages.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveImg(i);
                          setAutoplayPaused(true);
                          setTimeout(() => setAutoplayPaused(false), 5000);
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                          i === activeImg
                            ? "border-accent ring-1 ring-accent/30"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square rounded-2xl bg-background flex flex-col items-center justify-center gap-3 text-foreground/40">
                <Package className="w-20 h-20" />
                <span className="text-sm">No image</span>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-auto">
              {[
                { icon: Shield, label: "Warranty" },
                { icon: Truck, label: "Fast Delivery" },
                { icon: CheckCircle, label: "Genuine" },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 p-3 bg-background rounded-xl border border-border/50"
                >
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-[10px] text-foreground/50 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-4">
            <div>
              <Badge variant="secondary" className="text-[10px] mb-2">
                {CATEGORY_LABELS[product.category] || product.category}
              </Badge>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold leading-snug text-foreground">
                {product.name}
              </DialogTitle>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-accent font-heading">
                KES {product.price.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(parseFloat(avgRating)) ? "fill-blue-400 text-blue-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                {avgRating}
              </span>
              <span className="text-sm text-foreground/40">
                ({MOCK_REVIEWS.length})
              </span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full ${product.inStock !== false ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <span
                className={`text-sm font-medium ${product.inStock !== false ? "text-emerald-600" : "text-red-500"}`}
              >
                {product.inStock !== false ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <div className="border-t border-border/50 pt-4">
              <p className="text-sm text-foreground/70 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="border-t border-border/50 pt-4">
                <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-[10px] text-foreground/40 uppercase">
                        {key}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-foreground">Qty</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold text-foreground border-x border-border min-w-[40px] text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-foreground/50">Total</span>
                <span className="text-xl font-bold text-accent font-heading">
                  KES {totalPrice.toLocaleString()}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.inStock === false}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <p className="text-xs text-center text-foreground/30 mt-2">
                Free delivery on orders over KES 10,000
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 border-t border-border/50 pt-4 sm:pt-5 md:pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground font-heading">
              Customer Reviews
            </h3>
            <Badge variant="secondary" className="text-xs gap-1">
              <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
              {avgRating}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOCK_REVIEWS.map((review, idx) => (
              <Card
                key={idx}
                className="p-4 border border-border/50 bg-muted/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {review.author}
                    </p>
                    <p className="text-[11px] text-foreground/40">
                      {review.date}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? "fill-blue-400 text-blue-400" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {review.text}
                </p>
              </Card>
            ))}
          </div>
          <p className="text-[10px] text-center text-foreground/30 mt-4">
            Reviews are user-generated and unverified.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
