import { Gift, ArrowRight, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDustid } from "@/context/DustidContext";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const { openAuthModal, selectedContact } = useDustid();

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="Curated gifts" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        </div>
        <div className="container relative z-10 py-20 md:py-28">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Curated Gift Shop</p>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Thoughtful gifts, delivered with ease
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Browse curated gifts and send them directly to your loved ones — no address needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/collection">
                <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dustid Widget */}
      <section className="container -mt-6 relative z-20">
        <div className="rounded-2xl border border-lavender bg-lavender/30 p-6 md:p-8 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <Gift className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Send gifts using your Dustid contacts
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your Dustid address book and we'll handle the delivery details. No need to ask for addresses.
              </p>
            </div>
            {selectedContact ? (
              <div className="rounded-lg bg-background/80 border border-border px-5 py-3 text-sm">
                <span className="text-muted-foreground">Shopping for </span>
                <strong className="text-foreground">{selectedContact.name}</strong>
              </div>
            ) : (
              <Button className="h-12 px-6 text-base font-semibold gap-2 shrink-0" onClick={openAuthModal}>
                Connect to Dustid <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over £50" },
            { icon: Shield, title: "Secure Checkout", desc: "100% encrypted payments" },
            { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
              <Icon className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Featured Gifts</h2>
            <p className="mt-1 text-muted-foreground">Hand-picked presents for every occasion</p>
          </div>
          <Link to="/collection">
            <Button variant="ghost" className="gap-1 text-primary hover:text-primary">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Secondary Collection */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">More to Discover</h2>
              <p className="mt-1 text-muted-foreground">Explore our full range of curated gifts</p>
            </div>
            <Link to="/collection">
              <Button variant="ghost" className="gap-1 text-primary hover:text-primary">
                Shop All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(4, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
