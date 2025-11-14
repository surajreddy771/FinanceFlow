
'use client';

import { useState } from 'react';
import { Dashboard } from "@/components/dashboard";
import { Icons } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

type Language = 'en' | 'hi';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');

  const translations = {
    en: {
      title: 'FinanceFlow',
      language: 'Language',
    },
    hi: {
      title: 'फाइनेंसफ्लो',
      language: 'भाषा',
    }
  }

  const t = translations[language];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Icons.logo className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold tracking-tight text-primary">
              {t.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
              <div className='flex items-center gap-2'>
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Select onValueChange={(value: Language) => setLanguage(value)} defaultValue={language}>
                    <SelectTrigger className="w-[120px] h-9">
                        <SelectValue placeholder={t.language} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <Dashboard language={language}/>
        </div>
      </main>
      <footer className="py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        </div>
      </footer>
    </div>
  );
}
