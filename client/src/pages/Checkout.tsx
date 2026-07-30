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
  getInternetCoverageTowns,
} from "@/lib/servicePackages";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  MapPin,
  Navigation,
  Smartphone,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type CheckoutStep = "details" | "payment" | "processing" | "confirmation";
type PaymentMethod = "mpesa";

function StepIndicator({
  current,
  steps,
}: {
  current: string;
  steps: { key: string; label: string }[];
}) {
  const idx = steps.findIndex(s => s.key === current);
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 overflow-x-auto no-scrollbar px-2">
      {steps.map((s, i) => (
        <div
          key={s.key}
          className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"
        >
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
              i === idx
                ? "bg-accent text-white shadow-lg shadow-accent/20 scale-105"
                : i < idx
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200"
                  : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {i < idx ? (
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              <div
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i === idx ? "bg-white" : "bg-muted-foreground"}`}
              />
            )}
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-3 sm:w-6 h-px ${i < idx ? "bg-emerald-300" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<CheckoutStep>("details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    county: "Nairobi",
    town: "Roysambu",
    postalCode: "00100",
  });
  const [paymentMethod] = useState<PaymentMethod>("mpesa");
  const [orderNumber, setOrderNumber] = useState(`MG-${Date.now()}`);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [locating, setLocating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const createOrderMut = trpc.orders.create.useMutation();
  const mpesaInitMut = trpc.payments.mpesaInitiate.useMutation();
  const orderStatusQuery = trpc.orders.byOrderNumber.useQuery(
    { orderNumber },
    {
      enabled: step === "processing" && !!orderNumber,
      refetchInterval: 2000,
      retry: false,
    }
  );

  const countyTowns = useMemo(
    () => getTownsForCounty(formData.county),
    [formData.county]
  );
  const transportZone = useMemo(
    () => getTransportFee(formData.county, formData.town),
    [formData.county, formData.town]
  );
  const hasInternetPackage = items.some(item =>
    item.category?.toLowerCase().includes("internet")
  );
  const internetCovered = isInternetCoverageTown(formData.town);
  const tax = Math.round(total * 0.16);
  const totalAmount = total + transportZone.fee + tax;

  const steps = [
    { key: "details", label: "Details" },
    { key: "payment", label: "Payment" },
    { key: "processing", label: "Confirm" },
  ];

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
        setPaymentError(
          "Payment confirmation timed out. Your order is placed but payment is pending verification."
        );
        setStep("confirmation");
      }
    }
  }, [orderStatusQuery.data, step]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      step === "confirmation" &&
      !paymentError &&
      orderNumber &&
      !paymentError
    ) {
      toast.success("Payment successful! Thank you for your order.");
      const timer = setTimeout(() => navigate("/"), 4000);
      return () => clearTimeout(timer);
    }
  }, [step, paymentError, orderNumber]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === "county") {
        const towns = getTownsForCounty(value);
        return { ...prev, county: value, town: towns[0] ?? "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          let county =
            addr.county || addr.state_district || addr.state || "Nairobi";
          if (county.toLowerCase().includes("nairobi")) county = "Nairobi";
          const town =
            addr.town || addr.city || addr.village || addr.suburb || "Roysambu";
          const street = addr.road || addr.pedestrian || "";
          const building = addr.building || addr.house_number || "";
          setFormData(prev => ({
            ...prev,
            address: street
              ? `${building ? building + ", " : ""}${street}`
              : prev.address,
            county,
            town: getTownsForCounty(county).includes(town)
              ? town
              : getTownsForCounty(county)[0] || town,
          }));
          toast.success("Location detected");
        } catch {
          toast.error("Could not reverse geocode location");
        }
        setLocating(false);
      },
      () => {
        toast.error("Location access denied or unavailable");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePlaceOrder = async () => {
    setError("");
    setPaymentError("");
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.county ||
      !formData.town
    ) {
      setError("Please fill in all delivery and site location details");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    setStep("payment");
  };

  const handleCompletePayment = async () => {
    setPaymentError("");
    if (!user) {
      setPaymentError("Please sign in to complete your order");
      return;
    }

    try {
      const itemsData = items.map(i => ({
        productId: i.category !== "service" ? Number(i.id) : undefined,
        servicePackageId: i.category === "service" ? Number(i.id) : undefined,
        quantity: i.quantity,
        price: Number(i.price),
      }));

      const orderResult = await createOrderMut.mutateAsync({
        totalAmount,
        deliveryLocation: `${formData.address}, ${formData.town}, ${formData.county}`,
        paymentMethod,
        items: itemsData,
      });

      setOrderId(orderResult.orderId);
      setOrderNumber(orderResult.orderNumber);
      clearCart();

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

  const handleNewOrder = () => {
    clearCart();
    navigate("/products");
  };

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center px-4">
        <Card className="w-full max-w-lg p-8 md:p-12 text-center animate-fade-in border-0 shadow-xl">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2 font-heading">
            Your cart is empty
          </h2>
          <p className="text-foreground/60 mb-8">
            Add products or service packages before checking out.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate("/services")}
              size="lg"
              className="shadow-lg shadow-accent/20"
            >
              Browse Service Packages
            </Button>
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              size="lg"
            >
              Shop Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-start justify-center px-4 py-8">
        <Card className="w-full max-w-xl p-6 sm:p-8 md:p-10 animate-slide-up border-0 shadow-xl">
          <div className="text-center mb-8">
            {paymentError ? (
              <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-blue-500" />
              </div>
            ) : (
              <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-glow-pulse">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
            )}
            <h2 className="mb-2 text-2xl md:text-3xl font-bold text-foreground font-heading">
              {paymentError ? "Order Placed" : "Thank You!"}
            </h2>
            <p className="text-foreground/60 text-sm md:text-base">
              {paymentError || "Your order has been received and confirmed."}
            </p>
          </div>

          <div className="mb-6 rounded-2xl bg-muted/40 border border-border/50 p-5 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-xs text-foreground/40 uppercase tracking-wider font-medium">
                Order Summary
              </p>
            </div>
            <p className="text-lg md:text-xl font-bold text-accent font-heading mb-4 font-mono">
              {orderNumber}
            </p>

            <div className="space-y-2.5 border-b border-border/50 pb-4 mb-4">
              {items.length > 0
                ? items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground/80">
                        {item.name}{" "}
                        <span className="text-foreground/40">
                          x{item.quantity}
                        </span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatKes(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                : null}
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: "Customer", value: formData.name },
                { label: "Email", value: formData.email },
                { label: "Phone", value: formData.phone },
                {
                  label: "Delivery",
                  value: `${formData.address}, ${formData.town}, ${formData.county}`,
                },
                { label: "Transport", value: formatKes(transportZone.fee) },
                { label: "Subtotal", value: formatKes(total) },
                { label: "VAT (16%)", value: formatKes(tax) },
                { label: "Total", value: formatKes(totalAmount), accent: true },
                { label: "Payment", value: "M-Pesa" },
              ].map(r => (
                <div key={r.label} className="flex justify-between gap-4">
                  <span className="text-foreground/50">{r.label}</span>
                  <span
                    className={`font-semibold ${r.accent ? "text-accent text-base" : "text-foreground"}`}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-accent/5 border border-accent/10 p-4 text-sm text-foreground/70 leading-relaxed">
            <p className="font-semibold text-accent mb-1">What's next?</p>A
            Mwanga Grid technician will review your order, confirm transport and
            coverage, then contact you on <strong>{formData.phone}</strong> to
            schedule installation. You'll receive email updates at{" "}
            <strong>{formData.email}</strong>.
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleNewOrder}>
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/account")}
            >
              View My Orders
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container py-8 md:py-10">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Cart
          </button>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Checkout
          </h1>
          <p className="text-foreground/50 text-sm md:text-base mt-1.5">
            Complete your order in three simple steps.
          </p>
        </div>
      </div>

      <div className="container py-6 md:py-10">
        <StepIndicator current={step} steps={steps} />

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {step === "details" && (
              <Card className="p-6 md:p-8 border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground font-heading">
                      Delivery Details
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>
                {error && (
                  <div className="mb-6 rounded-xl bg-destructive/5 border border-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-name"
                        className="block text-sm font-medium text-foreground/70"
                      >
                        Full Name *
                      </label>
                      <Input
                        id="checkout-name"
                        autoComplete="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="bg-muted/30 border-0 focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-email"
                        className="block text-sm font-medium text-foreground/70"
                      >
                        Email *
                      </label>
                      <Input
                        id="checkout-email"
                        autoComplete="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="bg-muted/30 border-0 focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-phone"
                        className="block text-sm font-medium text-foreground/70"
                      >
                        M-Pesa Phone *
                      </label>
                      <Input
                        id="checkout-phone"
                        autoComplete="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0712 345 678"
                        className="bg-muted/30 border-0 focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-postal"
                        className="block text-sm font-medium text-foreground/70"
                      >
                        Postal Code
                      </label>
                      <Input
                        id="checkout-postal"
                        autoComplete="postal-code"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="00100"
                        className="bg-muted/30 border-0 focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="checkout-address"
                      className="block text-sm font-medium text-foreground/70"
                    >
                      Street Address / Building *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="checkout-address"
                        autoComplete="street-address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Building, estate, floor or landmark"
                        className="bg-muted/30 border-0 focus:bg-background transition-all flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={handleGetLocation}
                        disabled={locating}
                      >
                        {locating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-county"
                        className="block text-sm font-medium text-foreground/70"
                      >
                        County *
                      </label>
                      <select
                        id="checkout-county"
                        autoComplete="address-level1"
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        className="h-10 w-full rounded-xl bg-muted/30 border-0 px-3 text-sm text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                      >
                        {KENYA_COUNTIES.map(item => (
                          <option key={item.county} value={item.county}>
                            {item.county}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-town"
                        className="block text-sm font-medium text-foreground/70"
                      >
                        Town / Area *
                      </label>
                      <select
                        id="checkout-town"
                        autoComplete="address-level2"
                        name="town"
                        value={formData.town}
                        onChange={handleInputChange}
                        className="h-10 w-full rounded-xl bg-muted/30 border-0 px-3 text-sm text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                      >
                        {countyTowns.map(town => (
                          <option key={town} value={town}>
                            {town}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-accent/5 border border-accent/10 p-5 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {transportZone.label}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {transportZone.note}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-accent">
                        {formatKes(transportZone.fee)}
                      </p>
                    </div>
                    {hasInternetPackage ? (
                      <div
                        className={`pt-3 border-t border-accent/10 ${internetCovered ? "text-emerald-600" : "text-blue-600"}`}
                      >
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${internetCovered ? "bg-emerald-500" : "bg-blue-500"}`}
                          />
                          {internetCovered
                            ? "Internet demo coverage available in this area."
                            : "Outside standard internet coverage corridor."}
                        </p>
                        {!internetCovered && (
                          <details className="mt-2 text-xs text-foreground/50">
                            <summary className="cursor-pointer hover:text-foreground/70">
                              View coverage areas
                            </summary>
                            <ul className="mt-2 grid grid-cols-2 gap-1 pl-4 list-disc">
                              {getInternetCoverageTowns().map(t => (
                                <li key={t.name}>
                                  {t.name} — {t.desc}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <Button
                    className="w-full group"
                    size="lg"
                    onClick={handlePlaceOrder}
                  >
                    Continue to Payment
                    <ChevronRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            )}

            {step === "payment" && (
              <Card className="p-6 md:p-8 border-0 shadow-lg animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground font-heading">
                      Payment
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Choose your payment method
                    </p>
                  </div>
                </div>
                {paymentError && (
                  <div className="mb-6 rounded-xl bg-destructive/5 border border-destructive/10 p-4 text-sm text-destructive">
                    {paymentError}
                  </div>
                )}
                <div className="mb-8">
                  <div className="w-full rounded-2xl bg-accent/5 border-2 border-accent/20 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <Smartphone className="h-7 w-7 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg font-heading">
                          M-Pesa
                        </h3>
                        <p className="text-sm text-foreground/60">
                          STK push to{" "}
                          <strong>{formData.phone || "your phone"}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-6 rounded-2xl bg-accent/5 border border-accent/10 p-5 text-sm text-foreground/70 leading-relaxed">
                  Tap <strong>"Pay with M-Pesa"</strong> to receive an STK
                  prompt on <strong>{formData.phone}</strong>. Enter your M-Pesa
                  PIN to complete payment.
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("details")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    className="flex-1 group"
                    size="lg"
                    onClick={handleCompletePayment}
                    disabled={
                      createOrderMut.isPending || mpesaInitMut.isPending
                    }
                  >
                    {createOrderMut.isPending || mpesaInitMut.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Pay with M-Pesa
                  </Button>
                </div>
              </Card>
            )}

            {step === "processing" && (
              <Card className="p-8 md:p-12 text-center overflow-hidden relative border-0 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent/5 animate-ping"
                  style={{ animationDuration: "3s" }}
                />

                <div className="relative z-10">
                  <div
                    className="mx-auto mb-6 w-24 h-24 rounded-2xl bg-accent/10 flex items-center justify-center animate-bounce"
                    style={{ animationDuration: "2s" }}
                  >
                    <Smartphone className="h-12 w-12 text-accent" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-foreground font-heading">
                    Check Your Phone
                  </h2>
                  <p className="text-foreground/60 mb-1">
                    M-Pesa STK sent to <strong>{formData.phone}</strong>
                  </p>
                  <p className="text-sm text-foreground/40 mb-6">
                    Enter your PIN to confirm payment
                  </p>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-muted border border-border">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
                    </span>
                    <span className="text-sm text-foreground/60">
                      Waiting for confirmation...
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-foreground/40">
                    Order:{" "}
                    <span className="font-mono text-accent font-semibold">
                      {orderNumber}
                    </span>
                  </p>
                  {paymentError && (
                    <p className="mt-4 text-sm text-destructive">
                      {paymentError}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6 border-0 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingBag className="w-4 h-4 text-accent" />
                <h2 className="text-lg font-bold text-foreground font-heading">
                  Order Summary
                </h2>
              </div>
              <p className="text-xs text-foreground/40 mb-5">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
              <div className="mb-4 max-h-56 space-y-3 overflow-y-auto border-b border-border/50 pb-5">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground/70 truncate">
                      {item.name}{" "}
                      <span className="text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold whitespace-nowrap text-foreground">
                      {formatKes(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mb-6 space-y-2.5 pb-5">
                {[
                  { label: "Subtotal", value: formatKes(total) },
                  { label: "Transport", value: formatKes(transportZone.fee) },
                  { label: "VAT (16%)", value: formatKes(tax) },
                ].map(r => (
                  <div
                    key={r.label}
                    className="flex justify-between text-foreground/60 text-sm"
                  >
                    <span>{r.label}</span>
                    <span>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-accent font-heading">
                  {formatKes(totalAmount)}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
