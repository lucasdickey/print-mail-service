import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function Pricing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Pay only for what you send. No subscriptions or hidden fees.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 mt-8">
                <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-gray-850 justify-between border border-gray-200 dark:border-gray-800">
                  <div>
                    <h3 className="text-2xl font-bold text-center">Standard Mail</h3>
                    <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
                      <span className="text-4xl font-bold text-black dark:text-white">$2.99</span> / letter
                    </div>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>Up to 6 pages (black & white)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>Standard envelope</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>First-class mail</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>3-5 business days delivery</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link href="/upload?type=standard">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-gray-850 justify-between border border-gray-200 dark:border-gray-800">
                  <div>
                    <h3 className="text-2xl font-bold text-center">Premium Mail</h3>
                    <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
                      <span className="text-4xl font-bold text-black dark:text-white">$4.99</span> / letter
                    </div>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>Up to 10 pages (color available)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>Premium envelope</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>Priority mail</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>2-3 business days delivery</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link href="/upload?type=premium">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Additional pages: $0.10 per page (standard) or $0.25 per page (premium)</p>
                <p className="mt-2">International shipping available at additional cost</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

