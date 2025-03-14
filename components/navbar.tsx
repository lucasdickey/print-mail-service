import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary">
          Print Drop
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/orders">My Orders</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
