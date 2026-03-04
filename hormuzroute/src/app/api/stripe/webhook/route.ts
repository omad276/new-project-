import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getPlanByPriceId } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Type for subscription data we need
interface SubscriptionData {
  id: string;
  status: string;
  metadata?: { supabase_user_id?: string };
  items: { data: Array<{ price: { id: string } }> };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

function toSubscriptionData(obj: unknown): SubscriptionData {
  return obj as SubscriptionData;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          // Get subscription details
          const subscriptionRaw = await stripe.subscriptions.retrieve(subscriptionId);
          const subscription = toSubscriptionData(subscriptionRaw);
          const priceId = subscription.items.data[0]?.price.id;
          const plan = getPlanByPriceId(priceId);

          // Update profile plan
          await supabase
            .from('profiles')
            .update({
              plan,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId);

          // Create/update subscription record
          await supabase.from('subscriptions').upsert(
            {
              user_id: userId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              price_id: priceId,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            },
            {
              onConflict: 'stripe_subscription_id',
            }
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = toSubscriptionData(event.data.object);
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const priceId = subscription.items.data[0]?.price.id;
          const plan = getPlanByPriceId(priceId);

          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              price_id: priceId,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id);

          // Update plan if subscription is active
          if (subscription.status === 'active') {
            await supabase.from('profiles').update({ plan }).eq('id', userId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = toSubscriptionData(event.data.object);
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          // Downgrade to free
          await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId);

          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as { subscription?: string };
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
