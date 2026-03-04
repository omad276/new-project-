import { SupabaseClient } from '@supabase/supabase-js';
import { PLANS, PlanType } from './stripe';

export interface UsageStats {
  plan: PlanType;
  analysisCount: number;
  monthlyAnalysisCount: number;
  monthlyLimit: number;
  canAnalyze: boolean;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
}

export async function getUsageStats(
  supabase: SupabaseClient,
  userId: string
): Promise<UsageStats | null> {
  const { data, error } = await supabase.rpc('get_usage_stats', {
    p_user_id: userId,
  });

  if (error || !data || data.length === 0) {
    console.error('Error getting usage stats:', error);
    return null;
  }

  const stats = data[0];
  return {
    plan: stats.plan as PlanType,
    analysisCount: stats.analysis_count,
    monthlyAnalysisCount: stats.monthly_analysis_count,
    monthlyLimit: stats.monthly_limit,
    canAnalyze: stats.can_analyze,
    subscriptionStatus: stats.subscription_status,
    currentPeriodEnd: stats.current_period_end,
  };
}

export async function canUserAnalyze(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_analyze', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error checking analyze permission:', error);
    return false;
  }

  return data === true;
}

export async function recordAnalysis(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_analysis', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error recording analysis:', error);
    throw error;
  }
}

export function getRemainingAnalyses(stats: UsageStats): number {
  if (stats.monthlyLimit === -1) {
    return -1; // unlimited
  }
  return Math.max(0, stats.monthlyLimit - stats.monthlyAnalysisCount);
}

export function getPlanLimits(plan: PlanType) {
  return PLANS[plan].limits;
}
