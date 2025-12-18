
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Page Not Found
        </h2>
        <p className="text-muted-foreground">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go Back Home</Link>
      </Button>
    </div>
  )
}
