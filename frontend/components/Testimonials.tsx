import { Quote } from "lucide-react"
import { ClientTweetCard } from "@/components/ui/client-tweet-card"
import { testimonials } from "@/lib/content/testimonials"

export default function Testimonials() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="section-label text-coral">Loved by builders</p>
          <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            What people are saying.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-normal leading-7 text-night/80 sm:text-[18px]">
            Freelancers, agencies, and founders use ORKA to ship work and get paid
            securely. Here is what they share.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) =>
            item.type === "tweet" ? (
              <ClientTweetCard
                key={`tweet-${i}`}
                id={item.id}
                className="cut-corner rounded-[14px] border-2 border-night bg-white"
              />
            ) : (
              <figure
                key={`quote-${i}`}
                className="cut-corner flex flex-col justify-between rounded-[14px] border-2 border-night bg-white p-6"
              >
                <Quote size={28} className="mb-3 text-violet/40" />
                <blockquote className="text-sm font-bold leading-6 text-night/80">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div
                    className={`size-9 shrink-0 rounded-full bg-gradient-to-br ${
                      item.avatarColor ?? "from-violet to-orange"
                    }`}
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-night">{item.name}</p>
                    <p className="text-xs text-night/50">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            )
          )}
        </div>
      </div>
    </section>
  )
}
