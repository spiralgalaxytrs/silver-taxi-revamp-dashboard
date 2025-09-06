import { Bell, User } from 'lucide-react'
import { Button } from 'components/ui/button'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <h1 className="text-2xl font-semibold text-gray-800 hidden">Dashboard</h1>
      <div className="flex items-center">
        <Button variant="ghost" size="icon">
          <Bell className="h-7 w-7" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
