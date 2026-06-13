import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { CheckCircle, MapPin, CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"details" | "payment" | "confirmation">("details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [orderNumber] = useState(`ORD-${Date.now()}`);

  const totalAmount = total + 500 + Math.round(total * 0.16);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      alert("Please fill in all delivery details");
      return;
    }
    setStep("payment");
  };

  const handleCompletePayment = () => {
    setStep("confirmation");
  };

  const handleNewOrder = () => {
    clearCart();
    navigate("/products");
  };

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-foreground/60 mb-6">Add items to your cart before checkout</p>
            <Button onClick={() => navigate("/products")} size="lg">
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h2>
            <p className="text-foreground/60 mb-6">Thank you for your purchase</p>
            
            <div className="bg-muted p-6 rounded-lg mb-6 text-left">
              <p className="text-sm text-foreground/60 mb-2">Order Number</p>
              <p className="text-2xl font-bold text-accent mb-4">{orderNumber}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Customer:</span>
                  <span className="font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Email:</span>
                  <span className="font-semibold">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Total Amount:</span>
                  <span className="font-bold text-accent">KES {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Payment Method:</span>
                  <span className="font-semibold capitalize">{paymentMethod === "mpesa" ? "M-Pesa" : "Card"}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-foreground/60 mb-6">
              A confirmation email has been sent to {formData.email}. You will receive tracking information shortly.
            </p>

            <Button className="w-full mb-3" size="lg" onClick={handleNewOrder}>
              Continue Shopping
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/account")}>
              View My Orders
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white dark:bg-slate-950 border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-foreground/60">Complete your order</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {step === "details" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-accent" />
                  Delivery Details
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Phone *</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254 123 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Postal Code</label>
                      <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="00100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Street Address *</label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">City *</label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Nairobi"
                      />
                    </div>
                  </div>

                  <Button className="w-full mt-6" size="lg" onClick={handlePlaceOrder}>
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {step === "payment" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-accent" />
                  Payment Method
                </h2>

                <div className="space-y-4 mb-8">
                  {/* M-Pesa Option */}
                  <div
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "mpesa"
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-accent" />
                      <div>
                        <h3 className="font-bold text-foreground">M-Pesa</h3>
                        <p className="text-sm text-foreground/60">Pay via mobile money</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "card"
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-accent" />
                      <div>
                        <h3 className="font-bold text-foreground">Credit/Debit Card</h3>
                        <p className="text-sm text-foreground/60">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Demo Mode:</strong> This is a mock checkout. No actual payment will be processed.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                    Back
                  </Button>
                  <Button className="flex-1" size="lg" onClick={handleCompletePayment}>
                    Complete Order
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-border max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground/70">{item.name} x {item.quantity}</span>
                    <span className="font-semibold">KES {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-foreground/70">
                  <span>Subtotal:</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Shipping:</span>
                  <span>KES 500</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Tax (16%):</span>
                  <span>KES {Math.round(total * 0.16).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-accent">KES {totalAmount.toLocaleString()}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
