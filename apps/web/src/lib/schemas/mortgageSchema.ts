import {
  array,
  boolean,
  literal,
  maxValue,
  minValue,
  number,
  object,
  optional,
  string,
  union,
  pipe,
} from 'valibot';
import { type MortgageInput } from '../types/mortgage';

export const mortgageSchema = object({
  product: union([
    literal('hipoteca_fija'),
    literal('hipoteca_creciente'),
    literal('muda'),
    literal('remodela'),
    literal('tu_opcion_mexico'),
    literal('terreno'),
    literal('liquidez'),
  ]),
  propertyValue: pipe(number(), minValue(1)),
  ltv: pipe(number(), minValue(0), maxValue(1)),
  principal: optional(pipe(number(), minValue(1))),
  termMonths: pipe(number(), minValue(12), maxValue(480)),
  interest: object({
    bands: array(
      object({
        fromMonth: pipe(number(), minValue(1)),
        toMonth: optional(pipe(number(), minValue(1))),
        annualRate: pipe(number(), minValue(0), maxValue(1)),
      })
    ),
  }),
  growth: optional(
    object({
      annualIncreasePct: pipe(number(), minValue(0), maxValue(0.5)),
      increaseEndYear: pipe(number(), minValue(0), maxValue(40)),
      initialPagoPorMil: optional(pipe(number(), minValue(0))),
    })
  ),
  costs: object({
    openingCommissionPct: pipe(number(), minValue(0), maxValue(0.2)),
    adminDeferredMonthlyPct: pipe(number(), minValue(0), maxValue(0.01)),
    appraisalCost: pipe(number(), minValue(0)),
    notaryCost: pipe(number(), minValue(0)),
    preoriginationCost: pipe(number(), minValue(0)),
  }),
  insurance: object({
    lifeAnnualRateOnBalance: pipe(number(), minValue(0), maxValue(0.1)),
    hazardAnnualRateOnInsuredValue: pipe(number(), minValue(0), maxValue(0.1)),
    insuredValueFactor: pipe(number(), minValue(0), maxValue(1.2)),
    reindexInsuredValueAnnualPct: pipe(number(), minValue(0), maxValue(0.2)),
  }),
  prepayments: array(
    object({
      month: pipe(number(), minValue(1)),
      amount: pipe(number(), minValue(0)),
    })
  ),
  prepaymentMode: union([literal('reduce_term'), literal('reduce_installment')]),
  startDate: optional(string()),
  roundingMode: optional(
    union([literal('round'), literal('floor'), literal('ceil')])
  ),
}) satisfies import('valibot').BaseSchema<MortgageInput, MortgageInput, any>;
