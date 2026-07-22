import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import {
  SERVICE_CATEGORIES,
  formatKes,
  getPackagesForService,
  isInternetCoverageTown,
} from "@/lib/servicePackages";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import {
  CheckCircle2,
  MapPin,
  ShoppingCart,
  Wifi,
  Camera,
  Sun,
  Network,
  Headphones,
  Search,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";

const CATEGORY_ICONS: Record<string, typeof Wifi> = {
  security: Camera,
  networking: Network,
  solar: Sun,
  support: Headphones,
};

export default function Services() {
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const { data: dbServicesWithPkgs, isLoading } =
    trpc.services.withPackages.useQuery();
  const [searchSvc, setSearchSvc] = useState("");
  const [svcPage, setSvcPage] = useState(0);
  const perPage = 10;

  const addPackage = (
    name: string,
    price: number,
    category: string,
    id: number
  ) => {
    addItem({ id, name, price, category, image: "" });
    navigate("/cart");
  };

  const dbServices = (dbServicesWithPkgs || []).filter(
    (s: any) => s.isActive !== false
  );
  const hasDb = dbServices.some((s: any) => (s.packages || []).length > 0);
  const fallbackServices = SERVICE_CATEGORIES.filter(
    s => getPackagesForService(s.id).length > 0
  );

  const filterMatch = (item: any) =>
    !searchSvc || item.name?.toLowerCase().includes(searchSvc.toLowerCase());

  const filteredItems = hasDb
    ? dbServices.filter(filterMatch)
    : fallbackServices.filter(filterMatch);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const safePage = Math.min(svcPage, totalPages - 1);
  const paginated = filteredItems.slice(
    safePage * perPage,
    (safePage + 1) * perPage
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/70 bg-gradient-to-br from-background via-background to-muted/50">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-foreground mb-1 sm:mb-2">
            Services & Packages
          </h1>
          <p className="max-w-2xl text-foreground/60">
            Service packages are structured like a quote: package price, service
            area, transport estimate and installation lead time.
          </p>
        </div>
      </div>

      <div className="container py-6 md:py-12">
        <Card className="mb-12 border-border/70 bg-card/95 p-6 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Internet coverage focus
              </h2>
              <p className="text-sm text-muted-foreground">
                Internet installs are currently prioritised from Nairobi town
                through Roasters, Kasarani, Roysambu, Zimmerman, Kahawa and
                Githurai.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/quotation")}>
              Request site survey
            </Button>
          </div>
        </Card>

        {hasDb && (
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              name="searchServices"
              placeholder="Search services…"
              value={searchSvc}
              onChange={e => {
                setSearchSvc(e.target.value);
                setSvcPage(0);
              }}
              className="w-full pl-9 pr-4 h-10 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-16">
            {[1, 2, 3].map(s => (
              <section key={s}>
                <div className="mb-8 flex items-center gap-3">
                  <ShimmerSkeleton variant="circular" className="h-11 w-11" />
                  <ShimmerSkeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map(p => (
                    <div
                      key={p}
                      className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm p-6"
                    >
                      <ShimmerSkeleton className="h-4 w-20 mb-3" />
                      <ShimmerSkeleton className="h-6 w-48 mb-4" />
                      <ShimmerSkeleton className="h-8 w-32 mb-6" />
                      <div className="space-y-2 mb-8">
                        <ShimmerSkeleton className="h-4 w-full" />
                        <ShimmerSkeleton className="h-4 w-5/6" />
                        <ShimmerSkeleton className="h-4 w-4/6" />
                      </div>
                      <ShimmerSkeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          paginated.map((item: any) => {
            const pkgs = hasDb
              ? item.packages || []
              : getPackagesForService(item.id);
            const ServiceIcon = hasDb
              ? CATEGORY_ICONS[item.serviceType] || Wifi
              : item.icon;
            if (pkgs.length === 0) return null;

            return (
              <section key={item.id} className="mb-16">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <ServiceIcon className="h-6 w-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">
                        {item.name}
                      </h2>
                      {item.startingPrice && (
                        <Badge variant="secondary" className="text-xs">
                          From KES{" "}
                          {parseFloat(item.startingPrice).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <p className="max-w-3xl text-foreground/60">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {pkgs.map((pkg: any) => {
                    const pkgId = hasDb ? pkg.id : pkg.id;
                    const pkgName = hasDb ? pkg.tier : pkg.name;
                    const pkgTier = hasDb ? pkg.tier : pkg.tier;
                    const pkgPrice = hasDb ? parseFloat(pkg.price) : pkg.price;
                    const pkgFeatures = hasDb
                      ? pkg.features
                        ? pkg.features.split("\n").filter(Boolean)
                        : []
                      : pkg.features;
                    const pkgLeadTime = hasDb ? pkg.duration : pkg.leadTime;

                    return (
                      <Card
                        key={pkgId}
                        className="relative flex flex-col overflow-hidden border-border/70 p-4 sm:p-6 shadow-md card-hover"
                      >
                        <div className="mb-4 sm:mb-5 min-w-0">
                          <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-semibold uppercase tracking-wide text-accent line-clamp-1">
                            {pkgTier}
                          </p>
                          <h3 className="text-lg sm:text-2xl font-bold text-foreground line-clamp-2 break-words">
                            {pkgName}
                          </h3>
                          {pkgLeadTime && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 break-words">
                              {pkgLeadTime}
                            </p>
                          )}
                        </div>
                        <div className="mb-4 sm:mb-6">
                          <span className="text-2xl sm:text-4xl font-bold text-accent">
                            {formatKes(pkgPrice)}
                          </span>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            one-off package estimate
                          </p>
                        </div>
                        {pkgFeatures.length > 0 && (
                          <div className="mb-4 sm:mb-8 flex-1 space-y-2 sm:space-y-3 min-w-0">
                            {pkgFeatures.map((feature: string, fi: number) => (
                              <div
                                key={fi}
                                className="flex items-start gap-2 sm:gap-3"
                              >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-accent" />
                                <span className="text-xs sm:text-sm text-foreground/70 line-clamp-2 break-words">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button
                            onClick={() =>
                              addPackage(
                                pkgName || pkgTier,
                                pkgPrice,
                                item.name,
                                pkgId
                              )
                            }
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add package
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              navigate(`/quotation?packageId=${pkgId}`)
                            }
                          >
                            Quote with transport
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 px-2">
            <span className="text-sm text-foreground/40">
              Page {safePage + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSvcPage(safePage - 1)}
                disabled={safePage === 0}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSvcPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {filteredItems.length === 0 && searchSvc && (
          <Card className="p-16 text-center border-dashed border-2">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No services match your search
            </h3>
            <p className="text-foreground/60 mb-6">
              Try a different search term.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
