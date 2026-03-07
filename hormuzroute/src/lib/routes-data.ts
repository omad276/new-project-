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
  { id: 'houston', name: 'Houston', country: 'USA', region: 'americas' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', region: 'asia' },
];

// Route corridors/alternatives
export const ROUTE_BASE: Record<string, RouteBase> = {
  fujairah: {
    id: 'fujairah',
    name: 'Fujairah Pipeline Transfer',
    description:
      'Habshan-Fujairah pipeline bypasses Hormuz, then direct sea route. Fastest alternative.',
    seaDays: 0, // Will be calculated per destination
    landKm: 350, // Pipeline length
    riskLevel: 'low',
    requiresStrait: false,
  },
  petroline: {
    id: 'petroline',
    name: 'Petroline (East-West Pipeline)',
    description: 'Saudi East-West pipeline to Yanbu on Red Sea, then via Suez Canal.',
    seaDays: 0, // Reduced sea days
    landKm: 1200, // Pipeline length
    riskLevel: 'low',
    requiresStrait: false,
  },
  'cape-good-hope': {
    id: 'cape-good-hope',
    name: 'Cape of Good Hope',
    description: 'Full circumnavigation of Africa, avoiding all chokepoints. Longest but safest.',
    seaDays: 0, // Additional days will be added
    landKm: 0,
    riskLevel: 'low',
    requiresStrait: false,
  },
};

// Sea days from Gulf ports to destinations via different routes
export const SEA_DAYS_MATRIX: Record<string, Record<string, Record<string, number>>> = {
  // Via Fujairah Pipeline (bypasses Hormuz, direct sea)
  fujairah: {
    'ras-tanura': { rotterdam: 12, singapore: 8, shanghai: 14, mumbai: 3, houston: 22, tokyo: 10 },
    jubail: { rotterdam: 12, singapore: 8, shanghai: 14, mumbai: 3, houston: 22, tokyo: 10 },
    kuwait: { rotterdam: 13, singapore: 9, shanghai: 15, mumbai: 4, houston: 23, tokyo: 11 },
    basra: { rotterdam: 14, singapore: 10, shanghai: 16, mumbai: 5, houston: 24, tokyo: 12 },
  },
  // Via Petroline (pipeline to Red Sea, then via Suez)
  petroline: {
    'ras-tanura': { rotterdam: 16, singapore: 22, shanghai: 26, mumbai: 8, houston: 18, tokyo: 24 },
    jubail: { rotterdam: 16, singapore: 22, shanghai: 26, mumbai: 8, houston: 18, tokyo: 24 },
    kuwait: { rotterdam: 17, singapore: 23, shanghai: 27, mumbai: 9, houston: 19, tokyo: 25 },
    basra: { rotterdam: 18, singapore: 24, shanghai: 28, mumbai: 10, houston: 20, tokyo: 26 },
  },
  // Via Cape of Good Hope (full circumnavigation)
  'cape-good-hope': {
    'ras-tanura': {
      rotterdam: 28,
      singapore: 30,
      shanghai: 34,
      mumbai: 20,
      houston: 32,
      tokyo: 32,
    },
    jubail: { rotterdam: 28, singapore: 30, shanghai: 34, mumbai: 20, houston: 32, tokyo: 32 },
    kuwait: { rotterdam: 29, singapore: 31, shanghai: 35, mumbai: 21, houston: 33, tokyo: 33 },
    basra: { rotterdam: 30, singapore: 32, shanghai: 36, mumbai: 22, houston: 34, tokyo: 34 },
  },
};

// Risk premiums for insurance calculation (% of cargo value)
export const RISK_PREMIUMS: Record<RiskLevel, number> = {
  low: 0.008, // 0.8% of cargo value
  medium: 0.025, // 2.5% of cargo value
  high: 0.08, // 8% of cargo value (Hormuz crisis premium)
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

// Base cost comparison: Hormuz route when open (USD) - for % over base calculation
export const HORMUZ_BASE_COST: Record<string, number> = {
  rotterdam: 1_650_000,
  singapore: 1_200_000,
  shanghai: 1_400_000,
  houston: 1_900_000,
  tokyo: 1_550_000,
  mumbai: 800_000,
};

// Crisis statistics for display
export const CRISIS_STATS = {
  tankersStuck: 150,
  barrelsAtRisk: 20_000_000,
  dailyTrafficNormal: 21,
  percentGlobalOil: 20,
};
