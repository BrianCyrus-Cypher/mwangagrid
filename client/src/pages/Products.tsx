import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import ProductModal from "@/components/ProductModal";
import { useCart } from "@/contexts/CartContext";

export default function Products() {
  const [, navigate] = useLocation();
  const { data: products } = trpc.products.list.useQuery();
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = ["all", "routers", "cctv-cameras", "network-switches", "cables"];

  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleQuickAdd = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white dark:bg-slate-950 border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Product Catalog</h1>
          <p className="text-foreground/60">Premium networking and security solutions</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat === "all" ? "All Products" : cat.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition flex flex-col group">
                <div 
                  className="h-40 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-5xl cursor-pointer group-hover:scale-110 transition-transform"
                  onClick={() => handleViewDetails(product)}
                >
                  📦
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 
                    className="font-bold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-accent transition"
                    onClick={() => handleViewDetails(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-4 flex-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-accent">KES {product.price.toLocaleString()}</span>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded capitalize">
                      {product.category.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleViewDetails(product)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleQuickAdd(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-foreground/60 mb-4">No products found matching your search</p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      <ProductModal product={selectedProduct} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
