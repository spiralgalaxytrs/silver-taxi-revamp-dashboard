import type React from "react"
import Link from "next/link"

type ShortcutItem = {
  title: string
  href: string
  icon: React.ElementType
  color: string
  hoverColor: string
}

type ShortcutSectionProps = {
  shortcuts: ShortcutItem[]
}

export default function ShortcutSection({ shortcuts }: ShortcutSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon
        return (
          <Link key={shortcut.href} href={shortcut.href} className="block">
            <div className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${shortcut.color} ${shortcut.hoverColor} transition-all duration-300`}
              ></div>

              {/* Content */}
              <div className="relative flex items-center p-5">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{shortcut.title}</h3>
                </div>

                {/* Arrow indicator */}
                <div className="ml-auto transform transition-transform duration-300 group-hover:translate-x-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16l4-4-4-4" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-white/10"></div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

