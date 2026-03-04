import { Port, RouteBase, RiskLevel } from '@/types';

// Origin ports (Persian Gulf)
export const ORIGIN_PORTS: Port[] = [
  { id: 'ras-tanura', name: 'Ras Tanura', country: 'Saudi Arabia', region: 'gulf' },
  { id: 'jubail', name: 'Jubail', country: 'Saudi Arabia', region: 'gulf' },
  { id: 'kuwait', name: 'Kuwait City', country: 'Kuwait', region: 'gulf' },
  { id: 'basra', name: 'Basra', country: 'Iraq', region: 'gulf' },
];

// Destination ports
export const DESTINATION_PORTS: Port[] = [
  { id: 'rotterdam', name: 'Rotterdam', country: 'Netherlands', region: 'europe' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', region: 'asia' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', region: 'asia' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', region: 'asia' },
];

// Route corridors/alternatives
export const ROUTE_BASE: Record<string, RouteBase> = {
  'strait-hormuz-fujairah': {
    id: 'strait-hormuz-fujairah',
    name: 'Strait of Hormuz (via Fujairah)',
    description: 'Traditional route through the Strait of Hormuz to Fujairah, then onward via sea.',
    seaDays: 0, // Base - will be calculated per destination
    landKm: 0,
    riskLevel: 'high',
    requiresStrait: true,
  },
  petroline: {
    id: 'petroline',
    name: 'Petroline (East-West Pipeline)',
    description: 'Saudi pipeline from Eastern Province to Yanbu on Red Sea, bypassing Hormuz.',
    seaDays: 0, // Reduced sea days
    landKm: 1200, // Pipeline length
    riskLevel: 'low',
    requiresStrait: false,
  },
  'cape-good-hope': {
    id: 'cape-good-hope',
    name: 'Cape of Good Hope',
    description: 'Long sea route around Africa, avoiding all chokepoints but significantly longer.',
    seaDays: 0, // Additional days will be added
    landKm: 0,
    riskLevel: 'low',
    requiresStrait: false,
  },
};

// Sea days from Gulf ports to destinations via different routes
export const SEA_DAYS_MATRIX: Record<string, Record<string, Record<string, number>>> = {
  // Via Strait of Hormuz (direct)
  'strait-hormuz-fujairah': {
    'ras-tanura': { rotterdam: 22, singapore: 12, shanghai: 18, mumbai: 5 },
    jubail: { rotterdam: 22, singapore: 12, shanghai: 18, mumbai: 5 },
    kuwait: { rotterdam: 23, singapore: 13, shanghai: 19, mumbai: 6 },
    basra: { rotterdam: 24, singapore: 14, shanghai: 20, mumbai: 7 },
  },
  // Via Petroline (pipeline to Red Sea, then ship)
  petroline: {
    'ras-tanura': { rotterdam: 14, singapore: 16, shanghai: 22, mumbai: 10 },
    jubail: { rotterdam: 14, singapore: 16, shanghai: 22, mumbai: 10 },
    kuwait: { rotterdam: 15, singapore: 17, shanghai: 23, mumbai: 11 },
    basra: { rotterdam: 16, singapore: 18, shanghai: 24, mumbai: 12 },
  },
  // Via Cape of Good Hope
  'cape-good-hope': {
    'ras-tanura': { rotterdam: 35, singapore: 25, shanghai: 32, mumbai: 15 },
    jubail: { rotterdam: 35, singapore: 25, shanghai: 32, mumbai: 15 },
    kuwait: { rotterdam: 36, singapore: 26, shanghai: 33, mumbai: 16 },
    basra: { rotterdam: 37, singapore: 27, shanghai: 34, mumbai: 17 },
  },
};

// Risk premiums for insurance calculation
export const RISK_PREMIUMS: Record<RiskLevel, number> = {
  low: 0.001, // 0.1% of cargo value
  medium: 0.003, // 0.3% of cargo value
  high: 0.006, // 0.6% of cargo value
};

// Average cargo values per ton by cargo type (USD)
export const CARGO_VALUES_PER_TON: Record<string, number> = {
  crude: 600,
  refined: 800,
  lng: 400,
  lpg: 500,
  chemicals: 1200,
};

// Daily vessel operating cost (USD) - for a VLCC
export const DAILY_VESSEL_COST = 85_000;

// Reference vessel capacity (DWT)
export const REFERENCE_VESSEL_CAPACITY = 80_000;

// Land transport cost per km per ton (USD)
export const LAND_TRANSPORT_COST_PER_KM_TON = 0.0008;
