/*
  DRAFT: pending legal review

  Wording follows the app's own terms and privacy policy
  (app.remitbridgelabs.org/terms and /privacy) wherever the two say the same
  thing, so the lab does not make one promise on one site and another here.
  The privacy policy lists only what this repository actually stores: read
  supabase/schema.sql and the components that write to it before changing it.
*/
import { Link } from 'react-router-dom'
import Section, { PageHeader } from '@/components/Section'
import { CONTACT_EMAIL, LEGAL_ENTITY } from '@/lib/seo'

const UPDATED = 'October 8, 2026'

function Block({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  )
}

const Mail = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-primary hover:underline">
    {CONTACT_EMAIL}
  </a>
)

function Contact() {
  return (
    <Block title="Contact">
      <p>
        {LEGAL_ENTITY}
        <br />
        <Mail />
      </p>
    </Block>
  )
}

export function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy policy" intro={`Last updated ${UPDATED}`} />
      <Section>
        <div className="max-w-3xl">
          <p className="leading-relaxed">
            This site, remitbridgelabs.org, is operated by {LEGAL_ENTITY} (&ldquo;RemitBridge
            Labs&rdquo;, &ldquo;we&rdquo;), which is responsible for the data described here. No
            person who founded, runs or volunteers for RemitBridge Labs holds your data in their
            own name. The RemitBridge app has{' '}
            <a
              href="https://app.remitbridgelabs.org/privacy"
              className="font-bold text-primary hover:underline"
            >
              its own privacy policy
            </a>
            .
          </p>

          <Block title="Without an account">
            <p>
              Reading the site and using its tools needs no account. The calculators run in
              your browser. Exchange rates are fetched from our database and from Frankfurter,
              a public rate service, and the request carries only the currencies and the day.
            </p>
            <p>
              If you save a receipt check in TrueCost, it is kept in your own browser&rsquo;s
              storage and never sent to us. Clearing your browser&rsquo;s site data removes it.
            </p>
            <p>
              We count visits with Vercel Web Analytics, which uses no cookies and does not
              build a profile of you across sites. We use no advertising or third-party
              tracking.
            </p>
          </Block>

          <Block title="The contact form">
            <p>
              When you send a message, we store your name, the email address if you give one,
              why you wrote in, your message and when it was sent. A copy is emailed to the
              lab&rsquo;s inbox so someone reads it. Only lab staff can read messages.
            </p>
          </Block>

          <Block title="With an account">
            <p>An account is optional. If you create one, we store:</p>
            <ul>
              <li>your email address, and a password, which only Supabase holds, in hashed form;</li>
              <li>the name you give, and your role on the site;</li>
              <li>
                if you join a team, the team, a short bio you write, and whether you chose to be
                listed in the team directory (you are not listed unless you choose to be);
              </li>
              <li>
                a fellowship application, if you send one: the team, what you wrote, and its
                review status and notes;
              </li>
              <li>posts you write, and images you upload to them, if you have writing access.</li>
            </ul>
            <p>
              Database rules decide who can read each of these. Posts are public once
              published. Applications are read only by you and lab staff.
            </p>
          </Block>

          <Block title="Why we use it">
            <ul>
              <li>To run the site: signing you in, and keeping what you write and send.</li>
              <li>To answer messages and review fellowship applications.</li>
              <li>To see, as totals, which pages are read.</li>
            </ul>
            <p>We don&rsquo;t sell or rent your data, and we don&rsquo;t use it for advertising.</p>
          </Block>

          <Block title="Who processes it">
            <ul>
              <li>Supabase hosts the database, sign-in and uploaded images, in the United States.</li>
              <li>Vercel hosts the site and provides the visit counts.</li>
              <li>Resend delivers the email copy of contact-form messages to the lab.</li>
              <li>Frankfurter supplies exchange rates, and receives no personal data.</li>
            </ul>
          </Block>

          <Block title="How long it is kept">
            <p>
              Account details, applications and posts are kept while your account exists.
              Contact messages are kept until the lab deletes them, and are deleted on request.
            </p>
          </Block>

          <Block title="Deleting your data">
            <p>
              Write to <Mail /> from the address on your account and we will delete the account
              and everything linked to it: profile, applications, and posts and their images.
              You can ask us to delete a message you sent through the contact form the same
              way.
            </p>
          </Block>

          <Block title="Children">
            <p>
              The site is not directed at children under 13, and we do not knowingly collect
              personal information from them. If you believe a child under 13 has given us
              information, write to us and we will delete it.
            </p>
          </Block>

          <Block title="Changes">
            <p>If this policy changes, we&rsquo;ll update the date at the top.</p>
          </Block>

          <Contact />
        </div>
      </Section>
    </>
  )
}

export function Terms() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of use" intro={`Last updated ${UPDATED}`} />
      <Section>
        <div className="max-w-3xl">
          <p className="leading-relaxed">
            {LEGAL_ENTITY} (&ldquo;RemitBridge Labs&rdquo;, &ldquo;we&rdquo;) operates this site.
            By using it, you agree to these terms. Our{' '}
            <Link to="/privacy" className="font-bold text-primary hover:underline">
              privacy policy
            </Link>{' '}
            explains what we collect and why.
          </p>

          <Block title="Who you&rsquo;re agreeing with">
            <p>
              These terms are an agreement between you and RemitBridge Labs, and no one else.
              RemitBridge Labs is a legal entity of its own, separate from the people who
              founded it, run it, work or volunteer for it, contribute to it or support it, and
              from their families. None of those people is a party to these terms, or to any
              other agreement with you about this site, and none of them makes any promise to
              you personally.
            </p>
          </Block>

          <Block title="Not advice">
            <p>
              This site publishes research and tools that help explain what sending money costs.
              Nothing on it is financial or legal advice, and decisions about sending money are
              yours. RemitBridge Labs does not send, hold or exchange money, and is not a bank, a
              money transmitter or a broker.
            </p>
          </Block>

          <Block title="Using the site">
            <ul>
              <li>Use it lawfully.</li>
              <li>
                Don&rsquo;t try to break it, overload it, get around its limits, or copy its data
                in bulk by automated means.
              </li>
              <li>If you make an account, keep your password safe.</li>
              <li>We may limit or stop access for anyone who misuses the site.</li>
            </ul>
          </Block>

          <Block title="No warranty">
            <p>
              The site is free and provided as it is, without warranties of any kind. We work to
              keep its figures accurate and the site running, but we can&rsquo;t promise either.
            </p>
          </Block>

          <Block title="Limit of liability">
            <p>
              To the fullest extent the law allows, RemitBridge Labs is not liable for any loss
              that comes from using or relying on this site, including a figure that was out of
              date or wrong, or for any indirect, incidental, special, consequential or punitive
              damages, or lost money, profits or data. In any case, RemitBridge Labs&rsquo; total
              liability for all claims relating to this site is limited to $50. Some places
              don&rsquo;t allow some of these limits, so they may not all apply to you.
            </p>
          </Block>

          <Block title="Claims are against RemitBridge Labs only">
            <p>
              To the fullest extent the law allows, any claim or dispute relating to this site
              may be brought only against RemitBridge Labs. You agree not to bring it against any
              of RemitBridge Labs&rsquo; founders, directors, officers, employees, volunteers or
              contributors, or any member of their families, and none of them is personally
              liable to you for anything relating to this site. Each of them may rely on and
              enforce this section as if they had signed these terms.
            </p>
          </Block>

          <Block title="Time limit for claims">
            <p>
              Any claim relating to this site must be brought within one year after it arises,
              unless the law requires a longer period.
            </p>
          </Block>

          <Block title="Children">
            <p>The site is not directed at children under 13.</p>
          </Block>

          <Block title="Changes">
            <p>If these terms change, we&rsquo;ll update the date at the top.</p>
          </Block>

          <Block title="Law and courts">
            <p>
              These terms are governed by the laws of the State of Washington, United States.
              Any dispute relating to this site will be decided only in the state or federal
              courts located in Washington State, and you agree to their jurisdiction.
            </p>
          </Block>

          <Block title="If part of these terms doesn&rsquo;t apply">
            <p>
              If a court decides any part of these terms can&rsquo;t be enforced, that part is
              limited as little as needed, and the rest still applies.
            </p>
          </Block>

          <Contact />
        </div>
      </Section>
    </>
  )
}
