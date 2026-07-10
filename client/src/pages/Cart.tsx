import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [, navigate] = useLocation();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Shopping Cart</h1>
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-foreground/60 mb-6">Start shopping to add items to your cart</p>
            <Button onClick={() => navigate("/products")} size="lg">
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-foreground/60">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4 flex gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      // If image is a URL use it; otherwise fallback to emoji (prevents showing filenames/words).
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1 line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-foreground/60 mb-2 line-clamp-1 break-words">
                      {item.category}
                    </p>
                    <p className="text-lg font-bold text-accent">
                      KES {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-muted transition"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 font-semibold min-w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-muted transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-foreground/70">
                  <span>Subtotal:</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Transport:</span>
                  <span className="text-foreground/60">Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-foreground/70">
                  <span>Tax (16%):</span>
                  <span>KES {Math.round(total * 0.16).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-foreground">Total:</span>
                {/* Transport/VAT are calculated during checkout based on location */}
                <span className="text-3xl font-bold text-accent">
                  KES {(total + Math.round(total * 0.16)).toLocaleString()}
                </span>
              </div>

              <Button
                className="w-full mb-3"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>

              <button
                onClick={clearCart}
                className="w-full mt-4 text-red-600 hover:text-red-700 text-sm font-medium transition"
              >
                Clear Cart
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
