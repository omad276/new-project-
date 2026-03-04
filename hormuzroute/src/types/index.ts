export type CargoType = 'crude' | 'refined' | 'lng' | 'lpg' | 'chemicals';

export type Priority = 'cost' | 'time' | 'safety';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Port {
  id: string;
  name: string;
  country: string;
  region: 'gulf' | 'europe' | 'asia';
}

export interface RouteBase {
  id: string;
  name: string;
  description: string;
  seaDays: number;
  landKm: number;
  riskLevel: RiskLevel;
  requiresStrait: boolean;
}

export interface Route extends RouteBase {
  costUSD: number;
  extraDays: number;
  risk: number;
  score: number;
}

export interface RouteInput {
  origin: string;
  destination: string;
  cargoType: CargoType;
  tons: number;
  priority: Priority;
  cargoValueUSD?: number;
}

export interface CostBreakdown {
  landCost: number;
  seaCost: number;
  insurance: number;
  total: number;
}

export interface CalculatedRoute {
  route: RouteBase;
  costBreakdown: CostBreakdown;
  totalDays: number;
  riskScore: number;
  overallScore: number;
}

export interface CalculateRoutesResponse {
  routes: CalculatedRoute[];
  input: RouteInput;
}
