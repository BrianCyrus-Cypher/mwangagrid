import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ShoppingCart, Filter } from "lucide-react";
import { useState } from "react";

export default function Products() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  const { data: allProducts } = trpc.products.list.useQuery();
  const products = selectedCategory
    ? allProducts?.filter((p) => p.category === selectedCategory)
    : allProducts;

  const categories = ["routers", "cctv_cameras", "network_switches", "cables"];

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Products</h1>
          <p className="text-foreground/60">Browse our premium technology products</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-foreground">Categories</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-4 py-2 rounded transition ${
                    selectedCategory === null
                      ? "bg-accent text-white"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left px-4 py-2 rounded transition capitalize ${
                      selectedCategory === cat
                        ? "bg-accent text-white"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {cat.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center mx-auto">
                        <span className="text-2xl">📦</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-foreground mb-2">{product.name}</h3>
                    <p className="text-sm text-foreground/60 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-accent">KES {product.price}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-foreground/50 line-through ml-2">KES {product.discountPrice}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
