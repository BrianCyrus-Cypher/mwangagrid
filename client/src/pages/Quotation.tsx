import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Quotation() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    description: "",
    items: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to submit a quotation request");
      return;
    }
    alert("Quotation request submitted! Our team will review and contact you soon.");
    navigate("/account");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Request a Quote</h1>
          <p className="text-foreground/60">Get a custom quote for your specific needs</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Project Description</label>
                <Textarea
                  placeholder="Describe your project requirements, scope, and any specific needs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="min-h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Items Needed</label>
                <Textarea
                  placeholder="List the products or services you need (e.g., 4x CCTV cameras, 1x Network Switch, Installation service)"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  required
                  className="min-h-32"
                />
              </div>

              <div className="bg-accent/10 p-6 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">How It Works</h3>
                <ul className="text-sm text-foreground/70 space-y-2">
                  <li>✓ Submit your quotation request</li>
                  <li>✓ Our team reviews your requirements</li>
                  <li>✓ We prepare a detailed quote</li>
                  <li>✓ You receive the quote via email</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Quotation Request
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
