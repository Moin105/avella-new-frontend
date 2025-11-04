"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { calcCore, sanitize, type Inputs } from "@/lib/roi"

const money = (n: number) =>
  `$${(isFinite(n) ? n : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const clampPercent = (value: number) => Math.min(Math.max(isFinite(value) ? value : 0, 0), 100)
const clampNonNegative = (value: number) => Math.max(isFinite(value) ? value : 0, 0)

const PLATFORM_SUBSCRIPTION = 0

type CalculatorValues = {
  calls: number
  missed: number
  after_hours_share: number
  after_hours_uplift: number
  ai_conv: number
  no_show_base: number
  no_show_new: number
  ticket: number
  vc: number
  capacity: number
  wage: number
  min_per_answer: number
  min_per_booking: number
  pct_ai_handled: number
  answering_cost: number
  answering_replace: number
  ai_mins_per_call: number
  ai_cost_per_min: number
  sms_cost_per: number
  sms_per_booking: number
}

type IndustryPreset = {
  label: string
  description: string
  highlight: string
  defaults: CalculatorValues
  assumptions: string[]
}

type IndustryKey = "healthcare" | "hospitality" | "property" | "services" | "wellness"

type FieldConfig = {
  key: keyof CalculatorValues
  label: string
  description?: string
  step?: number
}

const INDUSTRY_PRESETS: Record<IndustryKey, IndustryPreset> = {
  healthcare: {
    label: "Healthcare & Clinics",
    description:
      "Give front-desk teams an always-on assistant that books visits, handles triage questions, and closes missed calls automatically.",
    highlight:
      "Practices typically recover two full-time schedules each month by deflecting voicemails and after-hours requests.",
    defaults: {
      calls: 450,
      missed: 32,
      after_hours_share: 35,
      after_hours_uplift: 18,
      ai_conv: 42,
      no_show_base: 20,
      no_show_new: 13,
      ticket: 210,
      vc: 60,
      capacity: 420,
      wage: 22,
      min_per_answer: 3,
      min_per_booking: 4,
      pct_ai_handled: 65,
      answering_cost: 900,
      answering_replace: 100,
      ai_mins_per_call: 2,
      ai_cost_per_min: 0.02,
      sms_cost_per: 0.02,
      sms_per_booking: 2,
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
      calls: 360,
      missed: 28,
      after_hours_share: 45,
      after_hours_uplift: 20,
      ai_conv: 38,
      no_show_base: 18,
      no_show_new: 12,
      ticket: 95,
      vc: 30,
      capacity: 340,
      wage: 18,
      min_per_answer: 2,
      min_per_booking: 3,
      pct_ai_handled: 60,
      answering_cost: 720,
      answering_replace: 100,
      ai_mins_per_call: 1.8,
      ai_cost_per_min: 0.018,
      sms_cost_per: 0.015,
      sms_per_booking: 2,
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
      calls: 280,
      missed: 35,
      after_hours_share: 40,
      after_hours_uplift: 18,
      ai_conv: 32,
      no_show_base: 25,
      no_show_new: 17,
      ticket: 350,
      vc: 120,
      capacity: 260,
      wage: 21,
      min_per_answer: 4,
      min_per_booking: 6,
      pct_ai_handled: 58,
      answering_cost: 680,
      answering_replace: 100,
      ai_mins_per_call: 2.4,
      ai_cost_per_min: 0.022,
      sms_cost_per: 0.018,
      sms_per_booking: 3,
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
      calls: 320,
      missed: 30,
      after_hours_share: 38,
      after_hours_uplift: 16,
      ai_conv: 34,
      no_show_base: 22,
      no_show_new: 15,
      ticket: 425,
      vc: 160,
      capacity: 300,
      wage: 26,
      min_per_answer: 3,
      min_per_booking: 5,
      pct_ai_handled: 58,
      answering_cost: 780,
      answering_replace: 100,
      ai_mins_per_call: 2.2,
      ai_cost_per_min: 0.02,
      sms_cost_per: 0.017,
      sms_per_booking: 2,
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
      calls: 400,
      missed: 33,
      after_hours_share: 42,
      after_hours_uplift: 17,
      ai_conv: 36,
      no_show_base: 21,
      no_show_new: 14,
      ticket: 140,
      vc: 40,
      capacity: 380,
      wage: 20,
      min_per_answer: 2.5,
      min_per_booking: 3.5,
      pct_ai_handled: 62,
      answering_cost: 640,
      answering_replace: 100,
      ai_mins_per_call: 2,
      ai_cost_per_min: 0.019,
      sms_cost_per: 0.015,
      sms_per_booking: 2,
    },
    assumptions: [
      "Automated pre-visit reminders save five minutes of manual texting per client.",
      "Membership renewal nudges capture 8% more clients with follow-ups toggled on.",
      "Retail add-ons average $28 per successful follow-up conversion.",
    ],
  },
}

const metricLabelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"
const metricValueClass = "text-2xl font-semibold text-foreground"

const percentFields: (keyof CalculatorValues)[] = [
  "missed",
  "after_hours_share",
  "after_hours_uplift",
  "ai_conv",
  "no_show_base",
  "no_show_new",
  "pct_ai_handled",
  "answering_replace",
]

const primaryFields: FieldConfig[] = [
  {
    key: "calls",
    label: "Monthly inbound requests",
    description: "Calls, texts, chats, or form fills Avella can capture each month.",
  },
  {
    key: "missed",
    label: "Missed-call rate (%)",
    description: "Share of inbound inquiries that currently go unanswered.",
  },
  {
    key: "ticket",
    label: "Revenue per completed booking ($)",
    description: "Average ticket size, visit value, or contract worth.",
  },
  {
    key: "pct_ai_handled",
    label: "% of calls AI can fully handle",
    description: "Portion of answered calls Avella can complete without live staff.",
  },
]

const ROIIndustryCalculator = () => {
  const [industry, setIndustry] = useState<IndustryKey>("healthcare")
  const [values, setValues] = useState<CalculatorValues>({ ...INDUSTRY_PRESETS.healthcare.defaults })

  const selectedIndustry = INDUSTRY_PRESETS[industry]

  useEffect(() => {
    setValues({ ...INDUSTRY_PRESETS[industry].defaults })
  }, [industry])

  const handleValueChange = (key: keyof CalculatorValues, rawValue: string) => {
    const parsed = Number(rawValue)
    const cleaned = percentFields.includes(key) ? clampPercent(parsed) : clampNonNegative(parsed)

    setValues((prev) => ({
      ...prev,
      [key]: cleaned,
    }))
  }

  const calculations = useMemo(() => {
    const inputs: Inputs = {
      C: values.calls,
      qBH: values.after_hours_share ? 1 - values.after_hours_share / 100 : 0.8,
      AR0_BH: (100 - values.missed) / 100,
      AR0_AH: Math.max(0, (100 - values.missed - 10) / 100),
      AR1_BH: Math.min(1, (100 - values.missed + values.after_hours_uplift) / 100),
      AR1_AH: Math.min(1, (100 - values.missed + values.after_hours_uplift + 10) / 100),
      BR0: Math.max(0.01, values.ai_conv / 100 - 0.1),
      BR1: values.ai_conv / 100,
      NS0: values.no_show_base / 100,
      NS1: values.no_show_new / 100,
      R: values.ticket,
      VC: values.vc,
      K: values.capacity,
      W: values.wage,
      M: values.min_per_answer,
      S: values.min_per_booking,
      PAI: values.pct_ai_handled / 100,
      ASbase: values.answering_cost,
      ASrep: values.answering_replace / 100,
      AIsub: PLATFORM_SUBSCRIPTION,
      mAI: values.ai_mins_per_call,
      pMin: values.ai_cost_per_min,
      SMSpp: values.sms_cost_per,
      SMSn: values.sms_per_booking,
    }

    const safeInputs = sanitize(inputs)
    const res = calcCore(safeInputs)

    const grossMonthly = res.dGP + res.laborSaved + res.answerSvcSaved
    const monthlyPlatformCost = res.AIcost
    const netMonthly = res.net
    const roiGross = monthlyPlatformCost > 0 ? grossMonthly / monthlyPlatformCost : null
    const roiNet = monthlyPlatformCost > 0 ? netMonthly / monthlyPlatformCost : null
    const paybackDays = netMonthly > 0 ? Math.ceil(monthlyPlatformCost / (netMonthly / 30)) : null

    return {
      grossMonthly,
      netMonthly,
      netAnnual: netMonthly * 12,
      monthlyPlatformCost,
      roiGross,
      roiNet,
      paybackDays,
      res,
    }
  }, [values])

  const renderField = (config: FieldConfig) => {
    const isPercent = percentFields.includes(config.key)
    const step = config.step ?? (isPercent ? 1 : 1)

    return (
      <div key={config.key as string} className="space-y-2">
        <Label htmlFor={config.key as string}>{config.label}</Label>
        <Input
          id={config.key as string}
          type="number"
          min={0}
          max={isPercent ? 100 : undefined}
          step={step}
          value={values[config.key]}
          onChange={(event) => handleValueChange(config.key, event.target.value)}
        />
        {config.description ? <p className="text-xs text-muted-foreground">{config.description}</p> : null}
      </div>
    )
  }

  return (
    <Card className="mx-auto max-w-6xl border-border/60 bg-background/70 shadow-xl backdrop-blur">
      <CardHeader className="gap-6 md:flex md:items-start md:justify-between">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-semibold text-foreground">Project Your ROI with Avella AI</CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed">
            Select the industry that matches your business and adjust the four quick inputs to mirror your operation. We pre-fill
            the detailed assumptions behind the scenes so you can focus on the levers that matter most.
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
              {primaryFields.map((field) =>
                renderField({
                  ...field,
                  step: field.step ?? (percentFields.includes(field.key) ? 1 : undefined),
                }),
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Advanced conversion, staffing, and cost assumptions stay aligned with each industry preset. Tweak the key drivers
              above or reset everything with a single click.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={() => setValues({ ...selectedIndustry.defaults })}>
                Reset to industry defaults
              </Button>
            </div>
          </div>

          <div className="space-y-6 rounded-lg border border-border/60 bg-background/80 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">Results snapshot</h3>
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4"
                  title="Estimates respond most to missed-call rate, conversion uplift, average ticket value, and capacity assumptions."
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
                    className="space-y-4"
                  >
                    <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Gross impact / month</span>
                        <span className="text-lg font-semibold">{money(Math.round(calculations.grossMonthly))}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Usage-based automation costs / month</span>
                        <span className="text-lg font-semibold">-{money(Math.round(calculations.monthlyPlatformCost))}</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm font-medium">Net impact / month</span>
                        <span
                          className={
                            "text-lg font-semibold " + (calculations.netMonthly >= 0 ? "text-emerald-600" : "text-rose-600")
                          }
                        >
                          {money(Math.round(calculations.netMonthly))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Net impact / year</span>
                        <span
                          className={
                            "text-lg font-semibold " + (calculations.netAnnual >= 0 ? "text-emerald-600" : "text-rose-600")
                          }
                        >
                          {money(Math.round(calculations.netAnnual))}
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
                          {calculations.paybackDays ? `${calculations.paybackDays} days` : "— (no payback at current inputs)"}
                        </span>
                      </div>
                      {calculations.netMonthly <= 0 && (
                        <div className="text-xs text-rose-600">
                          Net negative at current inputs—try adjusting missed calls, ticket size, or conversion lift.
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">Components (directional)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center justify-between">
                          <span>Gross profit delta</span>
                          <span>{money(Math.round(calculations.res.dGP))}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Labor savings</span>
                          <span>{money(Math.round(calculations.res.laborSaved))}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Answering service savings</span>
                          <span>{money(Math.round(calculations.res.answerSvcSaved))}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Usage-based costs (monthly)</span>
                          <span>-{money(Math.round(calculations.res.AIcost))}</span>
                        </li>
                      </ul>
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
                        {money(Math.round(calculations.grossMonthly * 12))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Net impact estimate (year 1): {money(Math.round(calculations.netAnnual))} after estimated usage-based costs.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <p className={metricLabelClass}>ROI multiple</p>
                        <p className={metricValueClass}>
                          {calculations.roiGross !== null && isFinite(calculations.roiGross)
                            ? `${calculations.roiGross.toFixed(1)}x`
                            : "—"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Compared to about {money(Math.round(calculations.monthlyPlatformCost))} in estimated usage-based costs.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <p className={metricLabelClass}>Payback period</p>
                        <p className={metricValueClass}>
                          {calculations.paybackDays ? `${calculations.paybackDays} days` : "— (no payback at current inputs)"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          How quickly savings and revenue cover estimated usage-based costs.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground pt-3">
                <strong>Disclaimer:</strong> This calculator provides directional estimates only and is for informational purposes.
                It does not guarantee outcomes, savings, or earnings. Actual results depend on your operations, pricing, demand,
                staffing, compliance, and third-party systems. Nothing herein is financial, legal, or medical advice. By using this
                tool, you agree that Avella AI makes no warranties or guarantees of performance.
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

