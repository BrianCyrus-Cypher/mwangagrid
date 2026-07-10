import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import {
  SERVICE_CATEGORIES,
  formatKes,
  getPackagesForService,
  isInternetCoverageTown,
} from "@/lib/servicePackages";
import { CheckCircle2, MapPin, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

export default function Services() {
  const [, navigate] = useLocation();
  const { addItem } = useCart();

  const addPackage = (pkg: ReturnType<typeof getPackagesForService>[number]) => {
    addItem({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      category: `${pkg.serviceName} - ${pkg.billing === "monthly" ? "monthly" : "package"}`,
      image: pkg.serviceId,
    });
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/70 bg-gradient-to-br from-background via-background to-muted/50">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Services & Packages</h1>
          <p className="max-w-2xl text-foreground/60">
            Service packages are structured like a quote: package price, service area, transport estimate and installation lead time.
          </p>
        </div>
      </div>

      <div className="container py-12">
        <Card className="mb-12 border-border/70 bg-card/95 p-6 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Internet coverage focus</h2>
              <p className="text-sm text-muted-foreground">
                Internet installs are currently prioritised from Nairobi town through Roasters, Kasarani, Roysambu, Zimmerman, Kahawa and Githurai.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/quotation")}>
              Request site survey
            </Button>
          </div>
        </Card>

        {SERVICE_CATEGORIES.map((service) => {
          const ServiceIcon = service.icon;
          const packages = getPackagesForService(service.id);

          return (
            <section key={service.id} className="mb-16">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <ServiceIcon className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">{service.name}</h2>
                  </div>
                  <p className="max-w-3xl text-foreground/60">{service.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`relative flex flex-col overflow-hidden border-border/70 p-6 shadow-md transition hover:shadow-xl ${
                      pkg.popular ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    {pkg.popular ? (
                      <div className="absolute right-0 top-0 bg-accent px-4 py-1 text-xs font-bold text-white">
                        POPULAR
                      </div>
                    ) : null}

                    <div className="mb-5 min-w-0">
                      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent line-clamp-1">
                        {pkg.tier}
                      </p>
                      <h3 className="text-2xl font-bold text-foreground line-clamp-2 break-words">
                        {pkg.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 break-words">
                        {pkg.leadTime}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-accent">{formatKes(pkg.price)}</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pkg.billing === "monthly" ? "per month, transport billed separately where applicable" : "one-off package estimate"}
                      </p>
                    </div>

                    {pkg.coverageNote ? (
                      <div className="mb-6 flex gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground min-w-0">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                        <span className="line-clamp-3 break-words">{pkg.coverageNote}</span>
                      </div>
                    ) : null}

                    <div className="mb-8 flex-1 space-y-3 min-w-0">
                      {pkg.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                          <span className="text-sm text-foreground/70 line-clamp-2 break-words">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {pkg.serviceId === "internet" ? (
                      <p className="mb-4 text-xs text-muted-foreground">
                        Coverage shown in checkout for towns such as Roysambu and Githurai:{" "}
                        {isInternetCoverageTown("Roysambu") ? "available for demo survey." : "subject to confirmation."}
                      </p>
                    ) : null}

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button onClick={() => addPackage(pkg)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add package
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/quotation?packageId=${pkg.id}`)}>
                        Quote with transport
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
