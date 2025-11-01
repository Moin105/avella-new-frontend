export type Inputs = {
  C: number;
  qBH: number;
  AR0_BH: number;
  AR0_AH: number;
  AR1_BH: number;
  AR1_AH: number;
  BR0: number;
  BR1: number;
  NS0: number;
  NS1: number;
  R: number;
  VC: number;
  K: number;
  W: number;
  M: number;
  S: number;
  PAI: number;
  ASbase: number;
  ASrep: number;
  AIsub: number;
  mAI: number;
  pMin: number;
  SMSpp: number;
  SMSn: number;
};

export type CalcResult = {
  answered0: number;
  answered1: number;
  booked0: number;
  booked1: number;
  completed0: number;
  completed1: number;
  gp0: number;
  gp1: number;
  dGP: number;
  laborSaved: number;
  answerSvcSaved: number;
  AIcost: number;
  net: number;
  roi: number | null;
  paybackDays: number | null;
  breakevenCompleted: number;
};

const clamp = (v: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.max(min, Math.min(max, isFinite(v) ? v : 0));

const clamp01 = (v: number) => clamp(v, 0, 1);

export function sanitize(i: Inputs): Inputs {
  return {
    ...i,
    qBH: clamp01(i.qBH),
    AR0_BH: clamp01(i.AR0_BH),
    AR0_AH: clamp01(i.AR0_AH),
    AR1_BH: clamp01(i.AR1_BH),
    AR1_AH: clamp01(i.AR1_AH),
    BR0: clamp01(i.BR0),
    BR1: clamp01(i.BR1),
    NS0: clamp01(i.NS0),
    NS1: clamp01(i.NS1),
    PAI: clamp01(i.PAI),
    ASrep: clamp01(i.ASrep),
    C: clamp(i.C),
    R: clamp(i.R),
    VC: clamp(i.VC),
    K: clamp(i.K),
    W: clamp(i.W),
    M: clamp(i.M),
    S: clamp(i.S),
    ASbase: clamp(i.ASbase),
    AIsub: clamp(i.AIsub),
    mAI: clamp(i.mAI),
    pMin: clamp(i.pMin),
    SMSpp: clamp(i.SMSpp),
    SMSn: clamp(i.SMSn),
  };
}

export function calcCore(raw: Inputs): CalcResult {
  const i = sanitize(raw);

  const answered0 = i.C * (i.qBH * i.AR0_BH + (1 - i.qBH) * i.AR0_AH);
  const answered1 = i.C * (i.qBH * i.AR1_BH + (1 - i.qBH) * i.AR1_AH);

  const booked0 = answered0 * i.BR0;
  const booked1 = answered1 * i.BR1;

  const completed0 = Math.min(i.K, booked0 * (1 - i.NS0));
  const completed1 = Math.min(i.K, booked1 * (1 - i.NS1));

  const unitGP = Math.max(0, i.R - i.VC);
  const gp0 = completed0 * unitGP;
  const gp1 = completed1 * unitGP;
  const dGP = gp1 - gp0;

  const min0 = answered0 * i.M + booked0 * i.S;
  const min1 = answered1 * (1 - i.PAI) * i.M + booked1 * (1 - i.PAI) * i.S;
  const minSaved = Math.max(0, min0 - min1);
  const laborSaved = (i.W / 60) * minSaved;

  const answerSvcSaved = i.ASbase * i.ASrep;

  const callsAI = answered1 * i.PAI;
  const AIusage = callsAI * i.mAI * i.pMin;
  const SMSCost = i.SMSpp * i.SMSn * booked1;
  const AIcost = i.AIsub + AIusage + SMSCost;

  const net = dGP + laborSaved + answerSvcSaved - AIcost;
  const roi = AIcost > 0 ? net / AIcost : null;
  const paybackDays = net > 0 ? Math.ceil(AIcost / (net / 30)) : null;

  const breakevenCompleted = unitGP > 0
    ? Math.max(0, (AIcost - laborSaved - answerSvcSaved) / unitGP)
    : Number.POSITIVE_INFINITY;

  return {
    answered0,
    answered1,
    booked0,
    booked1,
    completed0,
    completed1,
    gp0,
    gp1,
    dGP,
    laborSaved,
    answerSvcSaved,
    AIcost,
    net,
    roi,
    paybackDays,
    breakevenCompleted,
  };
}

