import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar"

const recentBookings = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "$1,999.00",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "$39.00",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "$299.00",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "$99.00",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "$39.00",
  },
]

export function RecentBookings() {
  return (
    <>
      <div className="space-y-8">
        {recentBookings.map((booking) => (
          <div key={booking.email} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/img/avatars/01.webp" alt="Avatar" />
              <AvatarFallback>{booking.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{booking.name}</p>
              <p className="text-sm text-muted-foreground">
                {booking.email}
              </p>
            </div>
            <div className="ml-auto font-medium">{booking.amount}</div>
          </div>
        ))}
      </div>
    </>
  )
}
