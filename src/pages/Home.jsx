import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Section, { Container, DisplayTitle } from '@/components/Section'
import WhyItMatters from '@/components/WhyItMatters'
import { buttonVariants } from '@/components/ui/button'
import { LogoMark } from '@/components/Logo'
import { featured } from '@/routes'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <>
      {/* Centred hero. No banner photo — the display type does the work. */}
      <section className="bg-card py-24 text-center sm:py-32">
        <Container width="prose">
          <LogoMark className="mx-auto mb-8 h-16 w-24 text-primary" />

          <DisplayTitle
            lead="Sending money home"
            accent={<>shouldn&rsquo;t cost this much</>}
          />

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A student research lab measuring what cross-border transfers actually cost,
            and testing whether newer payment rails can do it cheaper.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/truecost" className={buttonVariants({ size: 'hero' })}>
              Try the calculator
              <ArrowRight className="size-4" />
            </Link>
            {/* Was /remitbench, which is now filed under Coming soon. The
                blog is where the finished research actually is. */}
            <Link
              to="/blog"
              className={cn(buttonVariants({ variant: 'outline', size: 'hero' }))}
            >
              See the research
            </Link>
          </div>
        </Container>
      </section>

      <WhyItMatters />

      {/*
        Programs as a divided index rather than a card grid. Each row is one
        target, title on the left and description on the right, so they read as
        a list you scan down instead of panels you compare.
      */}
      <Section title="Start here">
        <ul className="border-t border-border">
          {featured.map((program) => (
            <li key={program.path} className="border-b border-border">
              <Link
                to={program.path}
                className="group flex flex-col gap-3 py-8 transition-colors sm:flex-row sm:items-baseline sm:gap-10"
              >
                <span className="text-2xl font-bold transition-colors group-hover:text-primary sm:w-56 sm:shrink-0">
                  {program.label}
                </span>
                <span className="flex-1 leading-relaxed text-muted-foreground">
                  {program.blurb}
                </span>
                <ArrowRight
                  className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
