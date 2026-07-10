import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, Package, CheckCircle, Truck, Shield } from "lucide-react";
import { useState } from "react";

interface ProductModalProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;
    inStock?: boolean;
    specifications?: string | Record<string, string>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_REVIEWS = [
  { author: "John K.", rating: 5, text: "Excellent product! Works perfectly as described. Very happy with the purchase.", date: "2 weeks ago" },
  { author: "Sarah M.", rating: 5, text: "Great quality and fast delivery. The team was very helpful with installation.", date: "1 month ago" },
  { author: "Peter N.", rating: 4, text: "Good value for money. Highly recommend Mwanga Grid.", date: "1 month ago" },
  { author: "Alice J.", rating: 5, text: "Best purchase I've made. Excellent after-sales support too!", date: "2 months ago" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "solar-equipment": "Solar Equipment",
  "cctv-cameras": "CCTV Cameras",
  "routers": "Routers",
  "network-switches": "Network Switches",
  "cables": "Cables",
};

export default function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      category: product.category,
    });
    onOpenChange(false);
    setQuantity(1);
  };

  const totalPrice = product.price * quantity;
  const avgRating = (MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);

  // Parse specifications
  let specs: Record<string, string> = {};
  if (product.specifications) {
    if (typeof product.specifications === "string") {
      try { specs = JSON.parse(product.specifications); } catch { specs = {}; }
    } else {
      specs = product.specifications;
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setImgError(false); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold leading-snug pr-8">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          {/* ── Left: Image + Specs ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 h-72 flex items-center justify-center overflow-hidden">
              {product.imageUrl && !imgError ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-foreground/40">
                  <Package className="w-20 h-20" />
                  <span className="text-sm">Product image</span>
                </div>
              )}
            </div>

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="bg-muted rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Specifications</h4>
                <div className="space-y-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-foreground/60">{key}</span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: "Warranty Included" },
                { icon: Truck, label: "Fast Delivery" },
                { icon: CheckCircle, label: "Genuine Product" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 p-3 bg-accent/5 rounded-lg text-center">
                  <item.icon className="w-5 h-5 text-accent" />
                  <span className="text-xs text-foreground/60 leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Details + Purchase ── */}
          <div className="space-y-5">
            {/* Category badge */}
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[product.category] || product.category}
            </Badge>

            {/* Price + Rating */}
            <div>
              <div className="text-4xl font-extrabold text-accent mb-2">
                KES {(product.price || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(parseFloat(avgRating)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{avgRating}</span>
                <span className="text-sm text-foreground/50">({MOCK_REVIEWS.length} reviews)</span>
              </div>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${product.inStock !== false ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${product.inStock !== false ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {product.inStock !== false ? "In Stock — Ready to Ship" : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Description</h3>
              <p className="text-foreground/70 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Quantity */}
            <div>
              <span className="font-semibold text-foreground block mb-2">Quantity</span>
              <div className="flex items-center gap-0 border border-border rounded-lg w-fit overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 hover:bg-muted transition-colors text-lg font-medium text-foreground"
                >
                  −
                </button>
                <span className="px-5 py-2.5 font-bold text-foreground border-x border-border min-w-14 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 hover:bg-muted transition-colors text-lg font-medium text-foreground"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total + Add to Cart */}
            <div className="bg-muted rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">Total ({quantity} {quantity === 1 ? "unit" : "units"})</span>
                <span className="text-2xl font-extrabold text-accent">KES {totalPrice.toLocaleString()}</span>
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
              <p className="text-xs text-center text-foreground/40">
                Free delivery on orders over KES 10,000
              </p>
            </div>
          </div>
        </div>

        {/* ── Customer Reviews ── */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_REVIEWS.map((review, idx) => (
              <Card key={idx} className="p-4 border-0 bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.author}</p>
                    <p className="text-xs text-foreground/50">{review.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">{review.text}</p>
              </Card>
            ))}
          </div>

          <p className="text-xs text-center text-foreground/40 mt-4">
            ⚠️ Reviews are user-generated and unverified. Content is provided for reference only.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
