import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  KENYA_COUNTIES,
  SERVICE_PACKAGES,
  formatKes,
  getPackageById,
  getTownsForCounty,
  getTransportFee,
  isInternetCoverageTown,
} from "@/lib/servicePackages";
import { Calculator, Loader2, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function getInitialPackageId() {
  if (typeof window === "undefined") return SERVICE_PACKAGES[0]?.id ?? 0;
  const raw = new URLSearchParams(window.location.search).get("packageId");
  const parsed = Number(raw);
  return getPackageById(parsed)?.id ?? SERVICE_PACKAGES[0]?.id ?? 0;
}

export default function Quotation() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    packageId: getInitialPackageId(),
    county: "Nairobi",
    town: "Roysambu",
    description: "",
    items: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedPackage =
    getPackageById(Number(formData.packageId)) ?? SERVICE_PACKAGES[0];
  const towns = useMemo(
    () => getTownsForCounty(formData.county),
    [formData.county]
  );
  const transportZone = useMemo(
    () => getTransportFee(formData.county, formData.town),
    [formData.county, formData.town]
  );
  const vat = Math.round(selectedPackage.price * 0.16);
  const quoteTotal = selectedPackage.price + transportZone.fee + vat;

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData(prev => {
      if (name === "county") {
        const nextTowns = getTownsForCounty(value);
        return { ...prev, county: value, town: nextTowns[0] ?? "" };
      }

      if (name === "packageId") {
        return { ...prev, packageId: Number(value) };
      }

      return { ...prev, [name]: value };
    });
  };

  const createQuotation = trpc.quotations.create.useMutation();
  const createTicket = trpc.supportTickets.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = `/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    setSubmitting(true);
    try {
      // Choice B: require STK demo init + mark "paid" before creating the admin ticket.
      const stkStateBefore = (() => {
        const phoneNormalized = formData.phone.replace(/\s/g, "");
        const ok = /^(\+254|254|0)?7\d{8}$/.test(phoneNormalized);
        return ok ? "sent" : "failed";
      })();

      const stkCode = `STK-${Math.floor(100000 + Math.random() * 900000)}`;

      // Encode quote + transport summary into what backend stores.
      const itemsForQuotation = [
        {
          servicePackageId: selectedPackage.id,
          serviceName: selectedPackage.serviceName,
          packageName: selectedPackage.name,
          packageTier: selectedPackage.tier,
          billing: selectedPackage.billing,
          packagePrice: selectedPackage.price,
          transportFee: transportZone.fee,
          vatEstimate: vat,
          totalEstimate: quoteTotal,
          county: formData.county,
          town: formData.town,
        },
        {
          projectDescription: formData.description,
          extraNotes: formData.items,
          customer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          },
        },
      ];

      const quotationDescription = [
        `Service quotation request (Mwanga Grid demo)`,
        `Customer: ${formData.name} (${formData.phone}${formData.email ? `, ${formData.email}` : ""})`,
        `Site: ${formData.town}, ${formData.county}`,
        `Package: ${selectedPackage.serviceName} - ${selectedPackage.name}`,
        `Transport: ${formatKes(transportZone.fee)} | VAT est: ${formatKes(vat)} | Total est: ${formatKes(quoteTotal)}`,
        `STK demo status (required by demo flow): ${stkStateBefore} | Request: ${stkCode}`,
        `Project description: ${formData.description || "-"}`,
        `Extra notes: ${formData.items || "-"}`,
      ].join("\n");

      const quotationRes = await createQuotation.mutateAsync({
        description: quotationDescription,
        items: itemsForQuotation,
        totalAmount: quoteTotal,
      });

      await createTicket.mutateAsync({
        subject: `Quotation ${quotationRes.quotationNumber} — Paid (STK demo)`,
        priority: "medium",
        description: [
          `Admin ticket created from client quotation.`,
          ``,
          `Quotation: ${quotationRes.quotationNumber}`,
          `Ticket source: /quotation`,
          ``,
          `Customer: ${formData.name} | ${formData.phone} | ${formData.email || "-"}`,
          `Site: ${formData.town}, ${formData.county}`,
          ``,
          `Package: ${selectedPackage.serviceName} - ${selectedPackage.name}`,
          `Package price: ${formatKes(selectedPackage.price)}`,
          `Transport: ${formatKes(transportZone.fee)}`,
          `VAT estimate: ${formatKes(vat)}`,
          `Estimated total: ${formatKes(quoteTotal)}`,
          ``,
          `STK demo: ${stkStateBefore} | Code: ${stkCode}`,
          ``,
          `Project description: ${formData.description || "-"}`,
          `Extra notes: ${formData.items || "-"}`,
        ].join("\n"),
      });

      setSubmitted(true);
      window.setTimeout(() => navigate("/account"), 900);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit quotation. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Card className="mx-auto max-w-lg p-10 text-center">
            <Calculator className="mx-auto mb-4 h-12 w-12 text-accent" />
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Quotation submitted
            </h1>
            <p className="text-muted-foreground">
              Mwanga Grid will confirm coverage, transport and final
              installation details before dispatch.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white dark:bg-slate-950">
        <div className="container py-12">
          <h1 className="mb-2 text-4xl font-heading font-bold text-foreground">
            Request a Quote
          </h1>
          <p className="text-foreground/60">
            Build a service quotation with package price, transport estimate and
            site location.
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="p-8 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="quote-name"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Name
                  </label>
                  <Input
                    id="quote-name"
                    autoComplete="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Customer name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-phone"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Phone
                  </label>
                  <Input
                    id="quote-phone"
                    autoComplete="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0712 345 678"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-email"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="quote-email"
                    autoComplete="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote-package"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Service Package
                </label>
                <select
                  id="quote-package"
                  autoComplete="off"
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SERVICE_PACKAGES.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.serviceName} - {pkg.name} ({formatKes(pkg.price)}
                      {pkg.billing === "monthly" ? "/mo" : ""})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="quote-county"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    County
                  </label>
                  <select
                    id="quote-county"
                    autoComplete="address-level1"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {KENYA_COUNTIES.map(item => (
                      <option key={item.county} value={item.county}>
                        {item.county}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="quote-town"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Town / Area
                  </label>
                  <select
                    id="quote-town"
                    autoComplete="address-level2"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {towns.map(town => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote-description"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Project Description
                </label>
                <Textarea
                  id="quote-description"
                  autoComplete="off"
                  name="description"
                  placeholder="Describe your site, expected users, cameras, appliances, internet needs or business workflow..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="min-h-28"
                />
              </div>

              <div>
                <label
                  htmlFor="quote-items"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Extra Items or Notes
                </label>
                <Textarea
                  id="quote-items"
                  autoComplete="off"
                  name="items"
                  placeholder="Example: extra camera, pole mount, cabling distance, battery preference, router location..."
                  value={formData.items}
                  onChange={handleChange}
                  className="min-h-24"
                />
              </div>

              <div className="rounded-lg bg-accent/10 p-6">
                <h3 className="mb-2 font-bold text-foreground">Quote flow</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>Submit package and site location.</li>
                  <li>
                    Team confirms internet coverage, CCTV/solar scope and
                    transport.
                  </li>
                  <li>
                    Client receives a final quote before installation dispatch.
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {submitting ? "Submitting..." : "Submit Quote Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/services")}
                >
                  Back to Packages
                </Button>
              </div>
            </form>
          </Card>

          <Card className="h-fit p-6">
            <div className="mb-5 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">
                Live Estimate
              </h2>
            </div>

            <div className="mb-5 rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-accent">
                {selectedPackage.serviceName}
              </p>
              <h3 className="mt-1 text-lg font-bold text-foreground">
                {selectedPackage.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedPackage.leadTime}
              </p>
            </div>

            <div className="mb-5 flex gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <span>
                {formData.town}, {formData.county} - {transportZone.note}
              </span>
            </div>

            {selectedPackage.serviceId === "internet" ? (
              <p
                className={`mb-5 rounded-lg p-3 text-sm ${isInternetCoverageTown(formData.town) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
              >
                {isInternetCoverageTown(formData.town)
                  ? "Internet survey is inside the Nairobi-Roysambu-Githurai demo corridor."
                  : "Internet package selected outside primary coverage. Quote will require manual confirmation."}
              </p>
            ) : null}

            <div className="space-y-3 border-b border-border pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-semibold">
                  {formatKes(selectedPackage.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transport</span>
                <span className="font-semibold">
                  {formatKes(transportZone.fee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT estimate</span>
                <span className="font-semibold">{formatKes(vat)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold text-foreground">Estimated quote</span>
              <span className="text-2xl font-bold text-accent">
                {formatKes(quoteTotal)}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
