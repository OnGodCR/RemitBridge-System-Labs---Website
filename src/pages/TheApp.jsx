import { Link } from 'react-router-dom'
import Section, { Container, PageHeader } from '@/components/Section'
import Backdrop from '@/components/Backdrop'
import { buttonVariants } from '@/components/ui/button'

const APP_SITE = 'https://app.remitbridgelabs.org'

/*
  The same four tools this site runs, in the order the app's own landing page
  tells them. Each links back to the web version, so a reader who has not got
  the app yet can try the thing being described. Screens are copied from the
  app repo's site/screens and should be refreshed from there, not retaken.
*/
const features = [
  {
    screen: 'fair-rate',
    name: 'Fair rate',
    title: 'Know a fair rate before you send',
    body: 'The mid-market rate is the honest yardstick. Drag the markup and watch what arrives shrink.',
    path: '/fair-rate',
  },
  {
    screen: 'true-cost',
    name: 'TrueCost',
    title: 'Find the cost hidden in the rate',
    body: 'Enter what a receipt says and see the fee and the exchange-rate markup as one number.',
    path: '/truecost',
  },
  {
    screen: 'rate-history',
    name: 'Rate history',
    title: 'Watch the rate move',
    body: 'Day by day, for 31 currencies. Drag across the chart to read any day.',
    path: '/rate-history',
  },
  {
    screen: 'scam-check',
    name: 'Scam check',
    title: 'Stop before you send to a stranger',
    body: 'Eight questions, one at a time, from FTC and CFPB guidance. Nothing you answer leaves your phone.',
    path: '/scam-check',
  },
]

function Phone({ screen, alt }) {
  return (
    <div className="mx-auto w-56 shrink-0 rounded-[2.2rem] bg-ink p-2 shadow-xl sm:w-64">
      <img
        src={`/app/${screen}.webp`}
        alt={alt}
        width="603"
        height="1311"
        loading="lazy"
        className="block h-auto w-full rounded-[1.8rem]"
      />
    </div>
  )
}

export default function AppPage() {
  return (
    <>
      <PageHeader
        eyebrow="The app"
        title="See what your family"
        accent="really receives"
        intro="RemitBridge is the lab's free app for iPhone and Android. It compares what it costs to send money from the United States by how much arrives, with the fee and the markup hidden in the exchange rate counted together."
      >
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <span className="mr-2 inline-block size-2 rounded-full border-2 border-primary align-middle" />
          Coming soon to the App Store and Google Play
        </p>
      </PageHeader>

      <Section>
        <ul className="space-y-20">
          {features.map((f, i) => (
            <li
              key={f.screen}
              className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
            >
              <div className={i % 2 ? 'md:order-2' : undefined}>
                <Phone screen={f.screen} alt={`The ${f.name} screen in the RemitBridge app`} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">
                  {String(i + 1).padStart(2, '0')} · {f.name}
                </p>
                <h2 className="mt-3 text-2xl sm:text-3xl">{f.title}</h2>
                <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{f.body}</p>
                <Link to={f.path} className="mt-5 inline-block font-bold text-primary hover:underline">
                  Try it on the web
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
        <Backdrop onDark fadeClass={null} />
        <Container className="relative">
          <h2 className="text-2xl sm:text-3xl">Ranked by what arrives. Nothing else.</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-current/90">
            No affiliate links, no paid placement and no ads. Providers cannot pay to rank
            higher. The app never sends, holds or exchanges money: it shows prices, and you
            send with the provider you choose.
          </p>
        </Container>
      </section>

      <Section>
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">Where it launches</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Sending from the US to India, Mexico, the Philippines and Vietnam, with more
            routes after that. The app speaks English first, with Hindi, Spanish, Tagalog and
            Vietnamese waiting on reviewers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={APP_SITE} className={buttonVariants({ size: 'lg' })}>
              Visit the app&rsquo;s site
            </a>
            <a
              href={`${APP_SITE}/privacy`}
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
            >
              App privacy policy
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}
