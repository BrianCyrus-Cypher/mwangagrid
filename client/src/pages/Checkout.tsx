import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";

export default function Checkout() {
  const [, navigate] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  const total = 35000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Order placed successfully! Order confirmation sent to your email.");
    navigate("/account");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Checkout</h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Delivery Information */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+254 (0) 123 456 789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Delivery Location</label>
                    <Input
                      type="text"
                      placeholder="Nairobi, Kenya"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-accent transition" style={{ borderColor: paymentMethod === "mpesa" ? "var(--accent)" : undefined }}>
                    <input
                      type="radio"
                      name="payment"
                      value="mpesa"
                      checked={paymentMethod === "mpesa"}
                      onChange={() => setPaymentMethod("mpesa")}
                      className="mr-4"
                    />
                    <Smartphone className="w-6 h-6 text-accent mr-3" />
                    <div>
                      <p className="font-bold text-foreground">M-Pesa</p>
                      <p className="text-sm text-foreground/60">Pay using M-Pesa mobile money</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-accent transition" style={{ borderColor: paymentMethod === "card" ? "var(--accent)" : undefined }}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mr-4"
                    />
                    <CreditCard className="w-6 h-6 text-accent mr-3" />
                    <div>
                      <p className="font-bold text-foreground">Credit/Debit Card</p>
                      <p className="text-sm text-foreground/60">Visa, Mastercard, or American Express</p>
                    </div>
                  </label>
                </div>
              </Card>

              <Button type="submit" className="w-full" size="lg">
                Complete Order
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-8 sticky top-20">
              <h3 className="font-bold text-lg text-foreground mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span>KES 35,000</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Shipping</span>
                  <span>KES 500</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Tax (16%)</span>
                  <span>KES 5,680</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold text-foreground mb-6">
                <span>Total</span>
                <span className="text-accent">KES 41,180</span>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm text-foreground/70">
                  {paymentMethod === "mpesa"
                    ? "You will receive an M-Pesa prompt to complete payment"
                    : "You will be redirected to our secure payment gateway"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
