import { Dashboard } from "@/components/dashboard";
import { Icons } from "@/components/icons";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-3">
            <Icons.logo className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold tracking-tight text-primary">
              FinanceFlow
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <Dashboard />
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by your AI assistant.
          </p>
        </div>
      </footer>
    </div>
  );
}
