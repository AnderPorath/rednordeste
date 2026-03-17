import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SavedJobsContent } from "./saved-jobs-content";

export default function SavedJobsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <SavedJobsContent />
      </main>
      <Footer />
    </div>
  );
}
