import { useState } from 'react'
import Section, { PageHeader, SectionImage, Subhead } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import labImage from '@/assets/remitbench-lab.jpg'

const architectures = [
  {
    name: 'Sharding (Layer-1)',
    strengths: 'Splits the work across more lanes',
    tps: '2,500 – 10,000+',
    latency: '2.5 s',
    finality: 'Probabilistic (2–3 blocks)',
    cost: '$0.001 – $0.05',
    interop: 'API gateway + bridge contract',
  },
  {
    name: 'Sidechains (Layer-2)',
    strengths: 'Own rules, own currency handling',
    tps: '1,500 – 5,000',
    latency: '1.2 s',
    finality: 'Mainnet checkpoint (15 min)',
    cost: '$0.005 – $0.02',
    interop: 'Custom relay + vault contracts',
  },
  {
    name: 'Off-chain payment channels',
    strengths: 'Cheapest and fastest, if the money is already parked',
    tps: '50,000+ (off-chain)',
    latency: '< 100 ms',
    finality: 'Instant (state update)',
    cost: '< $0.001',
    interop: 'HTLC + ISO 20022 intermediary',
  },
  {
    name: 'SWIFT / normal bank transfer',
    strengths: 'Every bank already accepts it',
    tps: '100 – 500 (batch)',
    latency: '1 – 5 business days',
    finality: 'Settlement account credit',
    cost: '$15 – $45 (fixed + FX)',
    interop: 'Native ISO 20022 / MT messaging',
  },
]

const workloads = [
  {
    id: 'ordinary',
    tab: 'Baseline',
    title: 'A normal week',
    description:
      'Regular family transfers, somewhere between $50 and $300, going out across four busy corridors. This is the boring case, and it is the one that matters most.',
    metrics: { 'Target throughput': '500 TPS', 'Average transfer': '$180', 'Latency threshold': '< 3.0 s', 'Failure tolerance': '0.01%' },
  },
  {
    id: 'small',
    tab: 'Small transfers',
    title: 'Small amounts, sent often',
    description:
      'Transfers of $10 to $50 going out every few days for groceries, a doctor visit, whatever came up. Fixed fees hurt the most here, since a flat $5 on a $30 transfer is a sixth of the money.',
    metrics: { 'Target throughput': '2,500 TPS', 'Average transfer': '$32', 'Latency threshold': '< 1.5 s', 'Failure tolerance': '0.005%' },
  },
  {
    id: 'holiday',
    tab: 'Holiday peak',
    title: 'Holiday rush',
    description:
      'What happens around Lunar New Year, Eid, and Christmas, when traffic jumps to about five times normal. Systems that look fine in the baseline test can fall over here.',
    metrics: { 'Target throughput': '8,000 TPS', 'Average transfer': '$250', 'Latency threshold': '< 5.0 s', 'Failure tolerance': '0.02%' },
  },
  {
    id: 'congestion',
    tab: 'Congestion',
    title: 'The network is busy',
    description:
      'Gas prices spike and cross-shard traffic piles up. We are mostly watching how much the fee swings, since a transfer that costs $0.01 one hour and $2 the next is hard to plan around.',
    metrics: { 'Target throughput': '10,000 TPS', 'Average transfer': '$150', 'Latency threshold': '< 8.0 s', 'Failure tolerance': '0.05%' },
  },
  {
    id: 'failure',
    tab: 'Node failure',
    title: 'Something breaks',
    description:
      'We drop nodes offline on purpose and slow down the bridges, then time how long the system takes to sort itself out.',
    metrics: { 'Target throughput': '1,200 TPS', 'Average transfer': '$200', 'Latency threshold': '< 4.0 s', 'Failure tolerance': '0.10%' },
  },
  {
    id: 'liquidity',
    tab: 'Low liquidity',
    title: 'The money runs out on the other end',
    description:
      'Payment channels only work if somebody on the receiving side is holding funds to pay out. When those pools run dry the routing just fails, and this test is where that shows up.',
    metrics: { 'Target throughput': '300 TPS', 'Average transfer': '$500', 'Latency threshold': '< 10 s', 'Failure tolerance': '0.50%' },
  },
]

export default function RemitBench() {
  const [active, setActive] = useState(workloads[0].id)

  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="RemitBench"
        intro="An open testbed for comparing blockchain scaling setups against an ordinary bank transfer, using synthetic traffic that behaves the way real remittance traffic does. Currently in development."
      />

      <Section>
        <div className="mb-10 rounded-2xl border border-border bg-muted p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            Still being built
          </p>
          <h2 className="mt-3 text-2xl">RemitBench is not finished yet</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            The testbed is under active development and has not produced results we are
            willing to publish. What is on this page is the design: the question we are
            asking, the setups we intend to compare, and the six tests we will run against
            each of them. The comparison table below is assembled from published
            specifications, not from our own measurements.
          </p>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            When there are real numbers, they will appear here with the code and the runs
            behind them.
          </p>
        </div>

        <SectionImage src={labImage} alt="A row of desktop workstations in a computer lab" />

        <p className="max-w-3xl leading-relaxed">
          The question we keep coming back to is which setup &mdash; sharding, sidechains,
          or off-chain channels &mdash; actually moves more transfers for less money, and
          whether any of them can talk to the bank rails that already exist. That second
          part gets skipped a lot. A system that is fast but cannot hand off to SWIFT or
          RTGS is not much use to a family whose bank is the only place they can pick up
          cash.
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          Everything here will run on synthetic traffic. We generate the transfers
          ourselves, so no real family&rsquo;s transfer history is involved anywhere in
          this.
        </p>
      </Section>

      <Section
        tone="card"
        title="How the setups compare"
        description="Drawn from each system\u2019s published specifications, for comparing designs against each other. These are not our measurements and should not be quoted as results."
      >
        <div className="overflow-x-auto rounded-2xl border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56">Setup</TableHead>
                <TableHead>Throughput</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Finality</TableHead>
                <TableHead>Cost range</TableHead>
                <TableHead className="min-w-48">Talks to banks via</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {architectures.map((a) => (
                <TableRow key={a.name}>
                  <TableCell className="align-top">
                    <span className="font-medium">{a.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {a.strengths}
                    </span>
                  </TableCell>
                  <TableCell className="align-top tabular-nums">{a.tps}</TableCell>
                  <TableCell className="align-top tabular-nums">{a.latency}</TableCell>
                  <TableCell className="align-top text-sm">{a.finality}</TableCell>
                  <TableCell className="align-top tabular-nums">{a.cost}</TableCell>
                  <TableCell className="align-top text-sm text-muted-foreground">
                    {a.interop}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section
        title="The six tests"
        description="The six scenarios we plan to put every setup through. Each one is a different kind of bad day, because a setup that only wins on the easy test is not really winning. None of these have been run yet."
      >
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="mb-5 h-auto flex-wrap justify-start">
            {workloads.map((w) => (
              <TabsTrigger key={w.id} value={w.id}>
                {w.tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {workloads.map((w) => (
            <TabsContent key={w.id} value={w.id}>
              <Card>
                <CardContent>
                  <Subhead className="mb-2">{w.title}</Subhead>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {w.description}
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-4">
                    {Object.entries(w.metrics).map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 text-lg tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </Section>
    </>
  )
}
