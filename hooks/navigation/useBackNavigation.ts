'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function useBackNavigation(lockBack: boolean) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (lockBack) {
                event.preventDefault()
                router.replace(pathname)
                history.pushState(null, '', pathname)
            }
        }

        if (lockBack) {
            history.pushState(null, '', pathname)
            window.addEventListener('popstate', handlePopState)
        }

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [lockBack, router, pathname])
}


