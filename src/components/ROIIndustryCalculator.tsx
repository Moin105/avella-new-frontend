"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const money = (n: number) =>
  `$${(isFinite(n) ? n : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const clamp = (v: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.max(min, Math.min(max, isFinite(v) ? v : 0))

type IndustryPreset = {
  label: string
  description: string
  highlight: string
  defaults: {
    monthlyLeads: number
    avgRevenue: number
    hourlyCost: number
    conversionRate: number
    automationRate: number
    includeFollowUps: boolean
  }
  metrics: {
    minutesPerInteraction: number
    followUpLift: number
    subscription: number
  }
  assumptions: string[]
}

const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  healthcare: {
    label: "Healthcare & Clinics",
    description:
      "Give front-desk teams an always-on assistant that books visits, handles triage questions, and closes missed calls automatically.",
    highlight: "Practices typically recover two full-time schedules each month by deflecting voicemails and after-hours requests.",
    defaults: {
      monthlyLeads: 450,
      avgRevenue: 210,
      hourlyCost: 22,
      conversionRate: 28,
      automationRate: 65,
      includeFollowUps: true,
    },
    metrics: {
      minutesPerInteraction: 7,
      followUpLift: 0.12,
      subscription: 1399,
    },
    assumptions: [
      "Roughly 35% of inquiries arrive after hours or when staff is already on the line.",
      "Automated visit prep eliminates two minutes of manual chart updates per appointment.",
      "Follow-up text nudges recapture 12% more no-shows when enabled.",
    ],
  },
  hospitality: {
    label: "Hospitality & Restaurants",
    description:
      "Automate reservations, private-event requests, and waitlist updates so hosts can focus on the guest experience.",
    highlight: "Operators report fewer walk-outs and 20% faster table turns after automating confirmations.",
    defaults: {
      monthlyLeads: 360,
      avgRevenue: 95,
      hourlyCost: 18,
      conversionRate: 22,
      automationRate: 60,
      includeFollowUps: true,
    },
    metrics: {
      minutesPerInteraction: 5,
      followUpLift: 0.09,
      subscription: 1099,
    },
    assumptions: [
      "Half of inbound volume spikes on weekends and evenings when staffing is leaner.",
      "Upsell prompts add prix fixe or tasting menus to 8% of automated bookings.",
      "Waitlist reminders reduce walk-offs, lifting conversion by 9% with follow-ups enabled.",
    ],
  },
  property: {
    label: "Property Management",
    description:
      "Capture tours, maintenance issues, and resident questions without overwhelming on-site teams.",
    highlight: "Communities using Avella cut voicemail backlogs to near zero within the first 30 days.",
    defaults: {
      monthlyLeads: 280,
      avgRevenue: 350,
      hourlyCost: 21,
      conversionRate: 18,
      automationRate: 55,
      includeFollowUps: true,
    },
    metrics: {
      minutesPerInteraction: 8,
      followUpLift: 0.1,
      subscription: 1299,
    },
    assumptions: [
      "Each leasing inquiry requires calendar coordination plus two follow-up touches on average.",
      "Virtual tour reminders reduce no-show tours by 14% when automation handles follow-ups.",
      "Maintenance triage trims three minutes from every inbound work-order call.",
    ],
  },
  services: {
    label: "Home & Field Services",
    description:
      "Route jobs, confirm schedules, and dispatch updates while your crews stay focused on work orders.",
    highlight: "Most teams reclaim an extra 40 labor hours per month by eliminating phone tag.",
    defaults: {
      monthlyLeads: 320,
      avgRevenue: 425,
      hourlyCost: 26,
      conversionRate: 24,
      automationRate: 58,
      includeFollowUps: true,
    },
    metrics: {
      minutesPerInteraction: 6,
      followUpLift: 0.07,
      subscription: 999,
    },
    assumptions: [
      "Technicians currently spend 6 minutes per inbound call between quoting and scheduling.",
      "Automated estimate reminders lift close rates by roughly 7%.",
      "Same-day job updates prevent two costly truck rolls per month on average.",
    ],
  },
  wellness: {
    label: "Wellness & Personal Care",
    description:
      "Book appointments, manage memberships, and nurture referrals without leaving clients waiting.",
    highlight: "Studios report 18% more repeat bookings when nurture cadences stay on automatically.",
    defaults: {
      monthlyLeads: 400,
      avgRevenue: 140,
      hourlyCost: 20,
      conversionRate: 30,
      automationRate: 62,
      includeFollowUps: true,
    },
    metrics: {
      minutesPerInteraction: 5,
      followUpLift: 0.08,
      subscription: 899,
    },
    assumptions: [
      "Automated pre-visit reminders save five minutes of manual texting per client.",
      "Membership renewal nudges capture 8% more clients with follow-ups toggled on.",
      "Retail add-ons average $28 per successful follow-up conversion.",
    ],
  },
}

type IndustryKey = keyof typeof INDUSTRY_PRESETS

const metricLabelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"
const metricValueClass = "text-2xl font-semibold text-foreground"

const ROIIndustryCalculator = () => {
  const [industry, setIndustry] = useState<IndustryKey>("healthcare")
  const [monthlyLeads, setMonthlyLeads] = useState<number>(INDUSTRY_PRESETS.healthcare.defaults.monthlyLeads)
  const [avgRevenue, setAvgRevenue] = useState<number>(INDUSTRY_PRESETS.healthcare.defaults.avgRevenue)
  const [hourlyCost, setHourlyCost] = useState<number>(INDUSTRY_PRESETS.healthcare.defaults.hourlyCost)
  const [conversionRate, setConversionRate] = useState<number>(INDUSTRY_PRESETS.healthcare.defaults.conversionRate)
  const [automationRate, setAutomationRate] = useState<number>(INDUSTRY_PRESETS.healthcare.defaults.automationRate)
  const [includeFollowUps, setIncludeFollowUps] = useState<boolean>(
    INDUSTRY_PRESETS.healthcare.defaults.includeFollowUps,
  )

  const selectedIndustry = INDUSTRY_PRESETS[industry]

  useEffect(() => {
    const defaults = INDUSTRY_PRESETS[industry].defaults
    setMonthlyLeads(defaults.monthlyLeads)
    setAvgRevenue(defaults.avgRevenue)
    setHourlyCost(defaults.hourlyCost)
    setConversionRate(defaults.conversionRate)
    setAutomationRate(defaults.automationRate)
    setIncludeFollowUps(defaults.includeFollowUps)
  }, [industry])

  const calculations = useMemo(() => {
    const guarded = {
      monthlyLeads,
      avgRevenue,
      hourlyCost,
      conversionRate,
      automationRate,
    }

    ;["conversionRate", "automationRate"].forEach((key) => {
      guarded[key as "conversionRate" | "automationRate"] = clamp(
        Number(guarded[key as keyof typeof guarded] ?? 0),
        0,
        100,
      )
    })

    ;["monthlyLeads", "avgRevenue", "hourlyCost"].forEach((key) => {
      guarded[key as "monthlyLeads" | "avgRevenue" | "hourlyCost"] = clamp(
        Number(guarded[key as keyof typeof guarded] ?? 0),
        0,
      )
    })

    const automationFraction = guarded.automationRate / 100
    const baselineConversion = guarded.conversionRate / 100
    const followUpLift = includeFollowUps ? selectedIndustry.metrics.followUpLift : 0
    const effectiveConversionRate = baselineConversion + automationFraction * followUpLift
    const baselineConverted = guarded.monthlyLeads * baselineConversion
    const projectedConverted = guarded.monthlyLeads * effectiveConversionRate
    const incrementalConversions = Math.max(projectedConverted - baselineConverted, 0)

    const incrementalRevenue = incrementalConversions * guarded.avgRevenue
    const hoursSaved =
      ((guarded.monthlyLeads * selectedIndustry.metrics.minutesPerInteraction) / 60) * automationFraction
    const laborSavings = hoursSaved * guarded.hourlyCost
    const grossMonthly = incrementalRevenue + laborSavings
    const subscription = selectedIndustry.metrics.subscription
    const grossMonthlyClamped = Math.max(0, grossMonthly)
    const netMonthly = grossMonthlyClamped - subscription
    const grossAnnual = grossMonthlyClamped * 12
    const netAnnual = netMonthly * 12
    const roiGross = subscription > 0 ? grossMonthlyClamped / subscription : null
    const roiNet = subscription > 0 ? netMonthly / subscription : null
    const paybackDays = netMonthly > 0 ? Math.ceil((subscription / netMonthly) * 30) : null

    const baselineLaborCost =
      (guarded.monthlyLeads * selectedIndustry.metrics.minutesPerInteraction * guarded.hourlyCost) / 60

    return {
      automationFraction,
      effectiveConversionRate,
      incrementalRevenue,
      hoursSaved,
      laborSavings,
      grossMonthly: grossMonthlyClamped,
      netMonthly,
      grossAnnual,
      netAnnual,
      roiGross,
      roiNet,
      paybackDays,
      baselineLaborCost,
      baselineConverted,
      projectedConverted,
      subscription,
    }
  }, [
    automationRate,
    avgRevenue,
    hourlyCost,
    includeFollowUps,
    monthlyLeads,
    conversionRate,
    selectedIndustry.metrics.followUpLift,
    selectedIndustry.metrics.minutesPerInteraction,
    selectedIndustry.metrics.subscription,
  ])

  const handleReset = () => {
    const defaults = selectedIndustry.defaults
    setMonthlyLeads(defaults.monthlyLeads)
    setAvgRevenue(defaults.avgRevenue)
    setHourlyCost(defaults.hourlyCost)
    setConversionRate(defaults.conversionRate)
    setAutomationRate(defaults.automationRate)
    setIncludeFollowUps(defaults.includeFollowUps)
  }

  return (
    <Card className="mx-auto max-w-6xl border-border/60 bg-background/70 shadow-xl backdrop-blur">
      <CardHeader className="gap-6 md:flex md:items-start md:justify-between">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-semibold text-foreground">
            Project Your ROI with Avella AI
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed">
            Select the industry that matches your business, tune the assumptions, and instantly see how Avella unlocks new revenue
            while shrinking labor spend. All numbers are editable so you can mirror your exact operation.
          </CardDescription>
          <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
            <Info className="h-4 w-4" />
            {selectedIndustry.highlight}
          </div>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <Label htmlFor="industry">Industry focus</Label>
          <Select value={industry} onValueChange={(value) => setIndustry(value as IndustryKey)}>
            <SelectTrigger id="industry" className="h-11">
              <SelectValue placeholder="Choose industry" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INDUSTRY_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{selectedIndustry.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_minmax(0,0.75fr)]">
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyLeads">Monthly inbound requests</Label>
                <Input
                  id="monthlyLeads"
                  type="number"
                  min={0}
                  value={monthlyLeads}
                  onChange={(event) => setMonthlyLeads(Math.max(Number(event.target.value) || 0, 0))}
                />
                <p className="text-xs text-muted-foreground">
                  Calls, texts, chats, or form fills you want Avella to capture every month.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgRevenue">Average revenue per conversion ($)</Label>
                <Input
                  id="avgRevenue"
                  type="number"
                  min={0}
                  value={avgRevenue}
                  onChange={(event) => setAvgRevenue(Math.max(Number(event.target.value) || 0, 0))}
                />
                <p className="text-xs text-muted-foreground">Ticket size, visit value, or contract worth for each won opportunity.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyCost">Hourly cost of live agent ($)</Label>
                <Input
                  id="hourlyCost"
                  type="number"
                  min={0}
                  value={hourlyCost}
                  onChange={(event) => setHourlyCost(Math.max(Number(event.target.value) || 0, 0))}
                />
                <p className="text-xs text-muted-foreground">Fully-loaded wages for the team that normally handles the workload.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversionRate">Current conversion rate (%)</Label>
                <Input
                  id="conversionRate"
                  type="number"
                  min={0}
                  max={100}
                  value={conversionRate}
                  onChange={(event) => setConversionRate(Math.min(Math.max(Number(event.target.value) || 0, 0), 100))}
                />
                <p className="text-xs text-muted-foreground">Share of inquiries that become jobs, bookings, or leases today.</p>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Automation coverage</p>
                  <p className="text-xs text-muted-foreground">
                    The percentage of interactions Avella handles end-to-end.
                  </p>
                </div>
                <div className="text-sm font-semibold text-primary">{automationRate}%</div>
              </div>
              <Slider
                value={[automationRate]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setAutomationRate(value[0] ?? 0)}
              />
              <div className="flex flex-col gap-3 rounded-md border border-dashed border-border/60 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable automated follow-ups</p>
                  <p className="text-xs text-muted-foreground">
                    Keeps texting or emailing prospects until they confirm, lifting conversions by
                    {" "}
                    {percentFormatter.format(selectedIndustry.metrics.followUpLift)} when active.
                  </p>
                </div>
                <Switch checked={includeFollowUps} onCheckedChange={setIncludeFollowUps} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleReset}>
                Reset to industry defaults
              </Button>
              <div className="text-xs text-muted-foreground">
                Baseline labor cost: {currencyFormatter.format(calculations.baselineLaborCost)} / month
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-lg border border-border/60 bg-background/80 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">Results snapshot</h3>
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4"
                  title="Estimates respond most to missed-call rate, conversion uplift, average ticket value, and the no-show delta you assume."
                >
                  What affects results?
                </button>
              </div>
              <Tabs defaultValue="monthly" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annual">Annual</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly">
                  <motion.div
                    key="monthly"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid gap-4"
                  >
                    <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Gross impact / month</span>
                        <span className="text-lg font-semibold">{money(Math.round(calculations.grossMonthly))}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Subscription</span>
                        <span className="text-lg font-semibold">-{money(Math.round(calculations.subscription))}</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm font-medium">Net impact / month</span>
                        <span
                          className={
                            "text-lg font-semibold " +
                            (calculations.netMonthly >= 0 ? "text-emerald-600" : "text-rose-600")
                          }
                        >
                          {money(Math.round(calculations.netMonthly))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Net impact / year</span>
                        <span
                          className={
                            "text-lg font-semibold " +
                            (calculations.netMonthly >= 0 ? "text-emerald-600" : "text-rose-600")
                          }
                        >
                          {money(Math.round(calculations.netMonthly * 12))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ROI (gross)</span>
                        <span className="text-lg font-semibold">
                          {calculations.roiGross !== null && isFinite(calculations.roiGross)
                            ? `${calculations.roiGross.toFixed(1)}×`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ROI (net)</span>
                        <span className="text-lg font-semibold">
                          {calculations.roiNet !== null && isFinite(calculations.roiNet)
                            ? `${calculations.roiNet.toFixed(1)}×`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Payback (est.)</span>
                        <span className="text-lg font-semibold">
                          {calculations.paybackDays
                            ? `${calculations.paybackDays} days`
                            : "— (no payback at current inputs)"}
                        </span>
                      </div>
                      {calculations.netMonthly <= 0 && (
                        <div className="text-xs text-rose-600">
                          Net negative at current inputs—try adjusting missed calls or ticket size.
                        </div>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {money(Math.round(calculations.laborSavings))} in labor savings +{" "}
                        {money(Math.round(calculations.incrementalRevenue))} in new revenue.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <p className={metricLabelClass}>Hours saved</p>
                        <p className={metricValueClass}>{calculations.hoursSaved.toFixed(1)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Team hours reclaimed from manual coordination.</p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <p className={metricLabelClass}>Projected conversions</p>
                        <p className={metricValueClass}>{Math.round(calculations.projectedConverted)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Up from {Math.round(calculations.baselineConverted)} today (
                          {percentFormatter.format(calculations.effectiveConversionRate)} conversion).
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
                <TabsContent value="annual">
                  <motion.div
                    key="annual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid gap-4"
                  >
                    <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
                      <p className={metricLabelClass}>Gross impact / year</p>
                      <p className={`${metricValueClass} text-primary`}>
                        {money(Math.round(calculations.grossAnnual))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Net impact estimate: {money(Math.round(calculations.netAnnual))} after subscription fees.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <p className={metricLabelClass}>ROI multiple</p>
                        <p className={metricValueClass}>
                          {calculations.roiGross !== null && isFinite(calculations.roiGross)
                            ? calculations.roiGross.toFixed(1) + "x"
                            : "—"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Compared to an estimated platform investment of {money(Math.round(calculations.subscription))} / month.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <p className={metricLabelClass}>Payback period</p>
                        <p className={metricValueClass}>
                          {calculations.paybackDays
                            ? `${calculations.paybackDays} days`
                            : "— (no payback at current inputs)"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">How quickly savings and revenue cover one month of Avella.</p>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground pt-3">
                <strong>Disclaimer:</strong> This calculator provides directional estimates only and is for informational
                purposes. It does not guarantee outcomes, savings, or earnings. Actual results depend on your operations,
                pricing, demand, staffing, compliance, and third-party systems. Nothing herein is financial, legal, or medical
                advice. By using this tool, you agree that Avella AI makes no warranties or guarantees of performance.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border/70 bg-muted/10 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Info className="h-4 w-4 text-primary" />
            Key assumptions
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {selectedIndustry.assumptions.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ROIIndustryCalculator
