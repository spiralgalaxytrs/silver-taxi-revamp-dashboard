'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const Route = useRouter()

  useEffect(() => {
    localStorage.clear()
    Route.push('/login')
  }, [Route])

  return (
    <>
      <section>

      </section>
    </>
  );
}
