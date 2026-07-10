import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import {
  KENYA_COUNTIES,
  formatKes,
  getTownsForCounty,
  getTransportFee,
  isInternetCoverageTown,
} from "@/lib/servicePackages";
import { CheckCircle, CreditCard, Loader2, MapPin, Smartphone, AlertCircle } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type CheckoutStep = "details" | "payment" | "processing" | "confirmation";
type PaymentMethod = "mpesa" | "card";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<CheckoutStep>("details");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", county: "Nairobi", town: "Roysambu", postalCode: "00100",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [orderNumber, setOrderNumber] = useState(`MG-${Date.now()}`);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const createOrderMut = trpc.orders.create.useMutation();
  const mpesaInitMut = trpc.payments.mpesaInitiate.useMutation();
  const orderStatusQuery = trpc.orders.byOrderNumber.useQuery(
    { orderNumber },
    { enabled: step === "processing" && !!orderNumber, refetchInterval: 2000, retry: false },
  );

  const countyTowns = useMemo(() => getTownsForCounty(formData.county), [formData.county]);
  const transportZone = useMemo(() => getTransportFee(formData.county, formData.town), [formData.county, formData.town]);
  const hasInternetPackage = items.some(item => item.category?.toLowerCase().includes("internet"));
  const internetCovered = isInternetCoverageTown(formData.town);
  const tax = Math.round(total * 0.16);
  const totalAmount = total + transportZone.fee + tax;

  useEffect(() => {
    if (step === "processing" && orderStatusQuery.data) {
      const s = orderStatusQuery.data as any;
      if (s.paymentStatus === "completed" || s.status !== "pending") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setStep("confirmation");
      }
      pollCountRef.current++;
      if (pollCountRef.current > 60) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setPaymentError("Payment confirmation timed out. Your order is placed but payment is pending verification.");
        setStep("confirmation");
      }
    }
  }, [orderStatusQuery.data, step]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === "county") {
        const towns = getTownsForCounty(value);
        return { ...prev, county: value, town: towns[0] ?? "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handlePlaceOrder = async () => {
    setError("");
    setPaymentError("");
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.county || !formData.town) {
      setError("Please fill in all delivery and site location details");
      return;
    }
    setStep("payment");
  };

  const handleCompletePayment = async () => {
    setPaymentError("");
    if (!user) { setPaymentError("Please sign in to complete your order"); return; }

    try {
      const itemsData = items.map(i => ({
        productId: i.category !== "service" ? Number(i.id) : undefined,
        servicePackageId: i.category === "service" ? Number(i.id) : undefined,
        quantity: i.quantity,
        price: i.price,
      }));

      const orderResult = await createOrderMut.mutateAsync({
        totalAmount,
        deliveryLocation: `${formData.address}, ${formData.town}, ${formData.county}`,
        paymentMethod,
        items: itemsData,
      });

      setOrderId(orderResult.orderId);
      setOrderNumber(orderResult.orderNumber);

      if (paymentMethod === "mpesa") {
        setStep("processing");
        pollCountRef.current = 0;
        await mpesaInitMut.mutateAsync({
          phoneNumber: formData.phone,
          amountKes: totalAmount,
          orderNumber: orderResult.orderNumber,
        });
      } else {
        setStep("confirmation");
      }
    } catch (err: any) {
      setPaymentError(err?.message || "Payment failed. Please try again.");
    }
  };

  const handleNewOrder = () => { clearCart(); navigate("/products"); };

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-foreground/60 mb-6">Add products or service packages before checkout.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate("/services")} size="lg">Browse Service Packages</Button>
              <Button onClick={() => navigate("/products")} variant="outline" size="lg">Shop Products</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Card className="mx-auto max-w-lg p-12 text-center">
            {paymentError ? (
              <AlertCircle className="mx-auto mb-4 h-20 w-20 text-amber-500" />
            ) : (
              <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-500" />
            )}
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              {paymentError ? "Order Placed (Payment Pending)" : "Order Confirmed"}
            </h2>
            <p className="mb-6 text-foreground/60">
              {paymentError
                ? paymentError
                : "Your order has been received and is being processed."}
            </p>
            <div className="mb-6 rounded-lg bg-muted p-6 text-left">
              <p className="mb-2 text-sm text-foreground/60">Order Number</p>
              <p className="mb-4 text-2xl font-bold text-accent">{orderNumber}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-foreground/60">Customer:</span>
                  <span className="font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-foreground/60">Site:</span>
                  <span className="text-right font-semibold">{formData.town}, {formData.county}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-foreground/60">Transport:</span>
                  <span className="font-semibold">{formatKes(transportZone.fee)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-foreground/60">Total:</span>
                  <span className="font-bold text-accent">{formatKes(totalAmount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-foreground/60">Payment:</span>
                  <span className="font-semibold">{paymentMethod === "mpesa" ? "M-Pesa" : "Card"}</span>
                </div>
              </div>
            </div>
            <p className="mb-6 text-sm text-foreground/60">
              A Mwanga Grid technician will confirm transport, coverage and installation timing before dispatch.
            </p>
            <Button className="mb-3 w-full" size="lg" onClick={handleNewOrder}>Continue Shopping</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/account")}>View My Orders</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white dark:bg-slate-950">
        <div className="container py-12">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Checkout</h1>
          <p className="text-foreground/60">Confirm site location, transport and payment.</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {step === "processing" && (
              <Card className="p-12 text-center">
                <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
                <h2 className="mb-2 text-2xl font-bold text-foreground">Processing Payment</h2>
                <p className="text-foreground/60 mb-2">
                  {paymentMethod === "mpesa"
                    ? "Check your phone and enter your M-Pesa PIN to complete payment."
                    : "Processing your card payment..."}
                </p>
                <p className="text-sm text-foreground/40">Order: {orderNumber}</p>
                {paymentMethod === "mpesa" && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-foreground/60">Waiting for M-Pesa confirmation...</span>
                  </div>
                )}
              </Card>
            )}

            {step === "details" && (
              <Card className="p-8">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
                  <MapPin className="h-6 w-6 text-accent" />
                  Delivery & Site Details
                </h2>
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Full Name *</label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Email *</label>
                      <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">M-Pesa Phone *</label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0712 345 678" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Postal Code</label>
                      <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="00100" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Street Address / Building *</label>
                    <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Building, estate, floor or landmark" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">County *</label>
                      <select name="county" value={formData.county} onChange={handleInputChange}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >{KENYA_COUNTIES.map(item => (
                        <option key={item.county} value={item.county}>{item.county}</option>
                      ))}</select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Town / Area *</label>
                      <select name="town" value={formData.town} onChange={handleInputChange}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >{countyTowns.map(town => (
                        <option key={town} value={town}>{town}</option>
                      ))}</select>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{transportZone.label}</p>
                        <p className="text-muted-foreground">{transportZone.note}</p>
                      </div>
                      <p className="text-lg font-bold text-accent">{formatKes(transportZone.fee)}</p>
                    </div>
                    {hasInternetPackage ? (
                      <p className={`mt-3 ${internetCovered ? "text-emerald-600" : "text-amber-600"}`}>
                        {internetCovered
                          ? "Internet demo coverage: available for survey in this town."
                          : "Internet coverage outside the Nairobi-Roysambu-Githurai corridor requires manual confirmation."}
                      </p>
                    ) : null}
                  </div>
                  <Button className="mt-6 w-full" size="lg" onClick={handlePlaceOrder}>Continue to Payment</Button>
                </div>
              </Card>
            )}

            {step === "payment" && (
              <Card className="p-8">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
                  <CreditCard className="h-6 w-6 text-accent" />
                  Payment Method
                </h2>
                {paymentError && (
                  <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">{paymentError}</div>
                )}
                <div className="mb-8 space-y-4">
                  <button type="button" onClick={() => setPaymentMethod("mpesa")}
                    className={`w-full rounded-lg border-2 p-6 text-left transition ${
                      paymentMethod === "mpesa" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-accent" />
                      <div>
                        <h3 className="font-bold text-foreground">M-Pesa STK Push</h3>
                        <p className="text-sm text-foreground/60">Pay with M-Pesa via STK push to {formData.phone}</p>
                      </div>
                    </div>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod("card")}
                    className={`w-full rounded-lg border-2 p-6 text-left transition ${
                      paymentMethod === "card" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-accent" />
                      <div>
                        <h3 className="font-bold text-foreground">Credit/Debit Card</h3>
                        <p className="text-sm text-foreground/60">Pay securely with your card (Stripe)</p>
                      </div>
                    </div>
                  </button>
                </div>
                {paymentMethod === "mpesa" && (
                  <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Click "Pay with M-Pesa" to receive an STK push prompt on {formData.phone}. Enter your PIN to complete payment.
                    </p>
                  </div>
                )}
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>Back</Button>
                  <Button className="flex-1" size="lg" onClick={handleCompletePayment} disabled={createOrderMut.isPending || mpesaInitMut.isPending}>
                    {createOrderMut.isPending || mpesaInitMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {paymentMethod === "mpesa" ? "Pay with M-Pesa" : "Pay with Card"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24 p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">Order Summary</h2>
              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto border-b border-border pb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-foreground/70">{item.name} x {item.quantity}</span>
                    <span className="font-semibold">{formatKes(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mb-6 space-y-3 border-b border-border pb-6">
                <div className="flex justify-between text-foreground/70">
                  <span>Subtotal:</span><span>{formatKes(total)}</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Transport:</span><span>{formatKes(transportZone.fee)}</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>VAT estimate (16%):</span><span>{formatKes(tax)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-accent">{formatKes(totalAmount)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
