import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Trash2, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<any[]>([]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
        </div>
      </div>

      <div className="container py-12">
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-foreground/60 mb-6">Start shopping to add items to your cart</p>
            <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <h3 className="font-bold text-foreground">{item.name}</h3>
                        <p className="text-sm text-foreground/60">Qty: 1</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-accent">KES {item.price}</span>
                        <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 sticky top-20">
                <h3 className="font-bold text-lg text-foreground mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-foreground/60">
                    <span>Subtotal</span>
                    <span>KES {total}</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Shipping</span>
                    <span>KES 500</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Tax</span>
                    <span>KES {Math.round(total * 0.16)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground mb-6">
                  <span>Total</span>
                  <span className="text-accent">KES {total + 500 + Math.round(total * 0.16)}</span>
                </div>
                <Button className="w-full" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
