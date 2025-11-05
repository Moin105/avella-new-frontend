"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const VIDEO_BASE_URL = "https://www.youtube.com/embed/JILGvASy8KA"

export function DemoVideoSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [shouldAutoplay, setShouldAutoplay] = useState(false)

  const videoSrc = useMemo(() => {
    if (shouldAutoplay) {
      return `${VIDEO_BASE_URL}?autoplay=1&mute=1`
    }

    return `${VIDEO_BASE_URL}?mute=1`
  }, [shouldAutoplay])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handlePlayDemo = () => {
      setShouldAutoplay(true)
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }

    window.addEventListener("play-demo-video", handlePlayDemo)

    return () => {
      window.removeEventListener("play-demo-video", handlePlayDemo)
    }
  }, [])

  return (
    <section id="demo-video" ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
          Always open. Always handled. See it below.
        </h2>
        <div className="mt-10 mx-auto max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-xl border border-border">
          <iframe
            className="w-full h-full"
            src={videoSrc}
            title="Avella AI Overview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
