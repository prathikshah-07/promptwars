import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { computeStatus } from '@/lib/trackLogic';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId');

    if (!trackingId) {
      return NextResponse.json({ error: 'trackingId query parameter is required.' }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          error: 'Tracking data is temporarily unavailable — data storage is not configured for this session.',
        },
        { status: 503 }
      );
    }

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('tracking_id', trackingId.trim())
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'No complaint found with that tracking ID. Please double-check and try again.' },
          { status: 404 }
        );
      }

      const status = computeStatus(data.timestamp);

      return NextResponse.json({
        trackingId: data.tracking_id,
        name: data.name,
        location: data.location,
        category: data.category,
        priority: data.priority,
        description: data.description,
        status,
        submittedAt: data.timestamp,
      });
    } catch (dbErr) {
      console.error('Supabase call failed (track):', dbErr?.message || dbErr);
      return NextResponse.json(
        { error: 'Could not retrieve complaint status right now. Please try again shortly.' },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error('Track API unexpected error:', err?.message || err);
    return NextResponse.json({ error: 'Something went wrong while tracking your complaint.' }, { status: 500 });
  }
}
