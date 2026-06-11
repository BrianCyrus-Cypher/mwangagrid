import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function Services() {
  const [, navigate] = useLocation();
  const { data: services } = trpc.services.list.useQuery();

  const getServicePackages = (serviceId: number) => {
    const query = trpc.services.packages.useQuery({ serviceId });
    return query.data || [];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Services & Packages</h1>
          <p className="text-foreground/60">Professional installation and support services</p>
        </div>
      </div>

      <div className="container py-12">
        {services?.map((service) => {
          const packages = getServicePackages(service.id);
          return (
            <div key={service.id} className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8">{service.name}</h2>
              <p className="text-foreground/60 mb-8">{service.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.map((pkg: any) => (
                  <Card key={pkg.id} className={`p-8 relative overflow-hidden hover:shadow-lg transition ${
                    pkg.tier === 'Premium' ? 'ring-2 ring-accent' : ''
                  }`}>
                    {pkg.tier === 'Premium' && (
                      <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-xs font-bold">POPULAR</div>
                    )}
                    <h3 className="text-2xl font-bold text-foreground mb-4">{pkg.tier}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-accent">KES {pkg.price}</span>
                      <p className="text-sm text-foreground/60 mt-2">per month</p>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {JSON.parse(pkg.features || '[]').map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/70">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full" onClick={() => navigate("/checkout")}>
                      Select Plan
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
