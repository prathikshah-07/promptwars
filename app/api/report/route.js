import { NextResponse } from 'next/server';
import { askAI } from '@/lib/askAI';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { keywordSuggest, generateTrackingId } from '@/lib/reportLogic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, location, category: userCategory, description } = body || {};

    if (!name || !location || !description) {
      return NextResponse.json(
        { error: 'Name, location, and description are required.' },
        { status: 400 }
      );
    }

    let category = userCategory && userCategory !== 'Auto-detect' ? userCategory : null;
    let priority = null;
    let usedFallback = false;

    if (!category || !priority) {
      const context =
        'You are a civic complaint triage assistant for an Indian municipal system. ' +
        'Given a complaint description, respond ONLY with a strict JSON object of the form ' +
        '{"category": "Roads|Water|Electricity|Sanitation|Public Safety|Other", "priority": "Low|Medium|High"}. ' +
        'No extra text, no markdown, no explanation — JSON only.';

      const aiResponse = await askAI(description, context);

      if (aiResponse) {
        try {
          const cleaned = aiResponse.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          const validCategories = ['Roads', 'Water', 'Electricity', 'Sanitation', 'Public Safety', 'Other'];
          const validPriorities = ['Low', 'Medium', 'High'];

          if (validCategories.includes(parsed.category) && validPriorities.includes(parsed.priority)) {
            category = category || parsed.category;
            priority = parsed.priority;
          } else {
            throw new Error('AI returned invalid category/priority values');
          }
        } catch (parseErr) {
          console.error('Failed to parse AI JSON for report triage:', parseErr?.message);
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }
    }

    // Fallback: pure JS keyword matching, zero API dependency.
    if (!category || !priority) {
      const suggestion = keywordSuggest(description);
      category = category || suggestion.category;
      priority = priority || suggestion.priority;
      usedFallback = true;
    }

    const trackingId = generateTrackingId();

    let savedToDb = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('complaints').insert({
          tracking_id: trackingId,
          name,
          location,
          category,
          description,
          priority,
          status: 'Submitted',
        });
        if (!error) savedToDb = true;
        else console.error('Supabase insert (complaints) error:', error.message);
      } catch (dbErr) {
        console.error('Supabase call failed (complaints):', dbErr?.message || dbErr);
      }
    }

    return NextResponse.json({
      trackingId,
      category,
      priority,
      usedFallback,
      savedToDb,
      message: savedToDb
        ? 'Complaint submitted successfully.'
        : 'Complaint processed, but could not be saved this session — please note your tracking ID.',
    });
  } catch (err) {
    console.error('Report API unexpected error:', err?.message || err);
    return NextResponse.json(
      { error: 'Something went wrong while submitting your complaint. Please try again.' },
      { status: 500 }
    );
  }
}
