import Navigation from "@/components/navigation";
import PhoneDirectory from "@/components/phone-directory";

export default function PhoneDirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <PhoneDirectory />
      </main>
    </div>
  );
}