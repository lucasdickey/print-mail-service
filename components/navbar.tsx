import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Print Drop
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link href="/orders">My Orders</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
