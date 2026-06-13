import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

interface ProductModalProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockReviews = [
  { author: "John K.", rating: 5, text: "Excellent product! Works perfectly.", date: "2 weeks ago" },
  { author: "Sarah M.", rating: 5, text: "Great quality and fast delivery.", date: "1 month ago" },
  { author: "Peter N.", rating: 4, text: "Good value for money. Highly recommend.", date: "1 month ago" },
  { author: "Alice J.", rating: 5, text: "Best purchase I've made. Very satisfied!", date: "2 months ago" },
];

const mockImages = [
  "🖼️", "📷", "🎨", "✨"
];

export default function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mockImages[selectedImageIndex],
      category: product.category,
    });
    onOpenChange(false);
    setQuantity(1);
  };

  const totalPrice = product.price * quantity;
  const avgRating = (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-8 mb-4 h-80 flex items-center justify-center text-6xl">
              {mockImages[selectedImageIndex]}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mockImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`p-3 rounded-lg text-2xl transition ${
                    idx === selectedImageIndex
                      ? "bg-accent text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {img}
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price & Rating */}
            <div>
              <div className="text-4xl font-bold text-accent mb-2">KES {product.price.toLocaleString()}</div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(parseFloat(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-foreground/60">({mockReviews.length} reviews)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-foreground/70">{product.description}</p>
            </div>

            {/* Category */}
            <div>
              <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center gap-2 border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted transition"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold min-w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-foreground/70">Total:</span>
                  <span className="text-2xl font-bold text-accent">KES {totalPrice.toLocaleString()}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-bold mb-4">Customer Reviews ({mockReviews.length})</h3>
          <div className="space-y-4">
            {mockReviews.map((review, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-sm text-foreground/60">{review.date}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-foreground/70">{review.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
