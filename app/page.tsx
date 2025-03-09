import { Navbar } from "@/components/navbar"
import { PrintMailWizard } from "@/components/print-mail-wizard"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-2">Print & Mail Your Documents</h1>
        <p className="text-center text-gray-500 mb-8">Using secure base64 encoding for file uploads</p>
        <div className="max-w-4xl mx-auto">
          <PrintMailWizard />
        </div>
      </div>
    </main>
  )
}

