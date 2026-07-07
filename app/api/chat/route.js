import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { askAI } from '@/lib/askAI';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import govtServices, { findMatchingService } from '@/lib/govtServices';

export const dynamic = 'force-dynamic';

const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi', ta: 'Tamil' };

function formatServiceAsText(service) {
  const lines = [
    `**${service.name}** (Issued by: ${service.authority})`,
    '',
    'Required Documents:',
    ...service.requiredDocs.map((d) => `- ${d}`),
    '',
    'Steps:',
    ...service.processSteps.map((s, i) => `${i + 1}. ${s}`),
    '',
    `Official portal: ${service.portalUrl}`,
  ];
  return lines.join('\n');
}

function genericFallback(lang) {
  const messages = {
    en: "I couldn't fully process that just now, but I can help with common services like Aadhaar, PAN, Voter ID, Ration Card, Passport, Driving License, and more. Try asking about one of these by name.",
    hi: "मैं अभी इसे पूरी तरह से प्रोसेस नहीं कर सका, लेकिन मैं आधार, पैन, वोटर आईडी, राशन कार्ड, पासपोर्ट, ड्राइविंग लाइसेंस जैसी सामान्य सेवाओं में मदद कर सकता हूँ। कृपया इनमें से किसी एक के बारे में पूछें।",
    ta: "இதை இப்போது முழுமையாக செயலாக்க முடியவில்லை, ஆனால் ஆதார், பான், வாக்காளர் அடையாள அட்டை, ரேஷன் கார்டு, பாஸ்போர்ட், ஓட்டுநர் உரிமம் போன்ற பொதுவான சேவைகளுக்கு உதவ முடியும். இவற்றில் ஒன்றைப் பற்றி கேளுங்கள்.",
  };
  return messages[lang] || messages.en;
}

function translationNotice(lang) {
  const notices = {
    hi: 'अनुवाद अस्थायी रूप से अनुपलब्ध है — नीचे अंग्रेज़ी में जानकारी दी गई है।',
    ta: 'மொழிபெயர்ப்பு தற்போது கிடைக்கவில்லை — கீழே ஆங்கிலத்தில் தகவல் கொடுக்கப்பட்டுள்ளது.',
  };
  return notices[lang] || null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, lang = 'en' } = body || {};

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // Session id: from cookie, or generate a fresh one.
    let sessionId = request.cookies.get('sb_session_id')?.value;
    const isNewSession = !sessionId;
    if (isNewSession) {
      sessionId = randomUUID();
    }

    const matchedService = findMatchingService(message);
    const languageName = LANGUAGE_NAMES[lang] || 'English';

    let responseText = null;
    let usedFallback = false;
    let translationUnavailable = false;

    const context = matchedService
      ? `You are Smart Bharat, a helpful Indian civic-services assistant. A user is asking about "${matchedService.name}". Here is authoritative reference data:\n${JSON.stringify(matchedService)}\n\nUsing ONLY this data, give a simple, plain-language, friendly answer explaining required documents and the process. Respond in ${languageName}. Keep it concise and use short lists where helpful.`
      : `You are Smart Bharat, a helpful Indian civic-services assistant covering services like Aadhaar, PAN, Voter ID, Ration Card, Passport, Driving License, Birth/Death Certificate, Income Certificate, Caste Certificate, Property Tax, Water Connection, Domicile Certificate, Senior Citizen Card, and Disability Certificate. Answer the user's question as helpfully as possible in ${languageName}. If it's unrelated to civic services, politely redirect them to ask about a government service.`;

    responseText = await askAI(message, context);

    if (!responseText) {
      usedFallback = true;
      if (matchedService) {
        // Structured fallback data only exists in English — be honest about
        // that instead of silently ignoring the selected language.
        responseText = formatServiceAsText(matchedService);
        if (lang !== 'en') {
          translationUnavailable = true;
        }
      } else {
        responseText = genericFallback(lang);
      }
    }

    // Persist the exchange, but never fail the request if this fails.
    let savedToDb = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('chats').insert({
          session_id: sessionId,
          message,
          response: responseText,
        });
        if (!error) savedToDb = true;
        else console.error('Supabase insert (chats) error:', error.message);
      } catch (dbErr) {
        console.error('Supabase call failed (chats):', dbErr?.message || dbErr);
      }
    }

    const res = NextResponse.json({
      response: responseText,
      usedFallback,
      translationUnavailable,
      savedToDb,
      availableServices: govtServices.map((s) => s.name),
    });

    if (isNewSession) {
      res.cookies.set('sb_session_id', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return res;
  } catch (err) {
    console.error('Chat API unexpected error:', err?.message || err);
    return NextResponse.json(
      {
        response: genericFallback('en'),
        usedFallback: true,
        savedToDb: false,
      },
      { status: 200 }
    );
  }
}
