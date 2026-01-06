// netlify/functions/edit.js
// Netlify serverless function for Claude API integration
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // or process.env.ClaudeAPI
});


const TECHNIQUES = {
  MW: 'Material Witness',
  PP: 'Polyphonic Possession',
  NH: 'Negative Historiography',
  AK: 'Abjection as Knowledge',
  TC: 'Temporal Collapse',
  LO: 'Labor as Ontology',
  SAP: 'Sensory Anchor Portal'
};


const CHAPTER_MAP = {
  1: { MW: 1, NH: 2, TC: 1, SAP: 3 },
  2: { NH: 3, SAP: 2 },
  3: { MW: 3, NH: 1, SAP: 2 },
  4: { PP: 3, TC: 3 },
  5: { PP: 1, AK: 3, TC: 1 },
  6: { MW: 3, PP: 3, NH: 3, AK: 1, TC: 3, SAP: 3 },
  7: { AK: 3, LO: 3, SAP: 1 },
  8: { MW: 1, PP: 2, NH: 3, TC: 1 },
  9: { MW: 2, NH: 1, AK: 2, LO: 2 },
  10: { MW: 2, PP: 1, TC: 2, LO: 2, SAP: 2 }
};

const PLOT_FUNCTIONS = {
  1: "Entry/Threshold — narrator enters charged landscape, movement through space, first sensory anchor contact, no inciting incident",
  2: "Orientation Through Absence — world explained by what's missing, gaps in records/maps, authority encountered indirectly",
  3: "Pattern Emergence — repetition reveals structure, objects recur, spaces revisited, quiet recognition through accumulation",
  4: "Compression — pressure replaces progression, tasks accelerate, interior/exterior collapse, shift from observation to occupation",
  5: "Fracture — narrative coherence fails, bodily strain/breakdown, contradictory sequences, crisis not climax",
  6: "The Grinding Stones (KEYSTONE) — past and present fully coexist, historical labor intrudes bodily, possession not memory, structural center",
  7: "Human Labor — meaning enacted not interpreted, sustained physical work, exhaustion replaces insight, rebuilds through body",
  8: "Recognition Without Resolution — understanding arrives but solves nothing, awareness sharpens, no action follows, refuses catharsis",
  9: "Reverberation — consequences unfold quietly, small gestures, spaces register what occurred, aftermath without spectacle",
  10: "Integration/Exit — return to threshold, sensory anchor reappears altered, closure through recontextualization not resolution"
};

const FORBIDDEN = {
  1: "No backstory. No motivation statements. No explanation of arrival.",
  2: "No historical exposition. No corrective narration. No filling gaps.",
  3: "No symbolic interpretation of objects. No thematic summary.",
  4: "No pauses for reflection. No clarifying transitions.",
  5: "No repair of coherence. No emotional resolution.",
  6: "No dates. No named historical explanations. No interpretive framing of stones.",
  7: "No metaphorical labor. No insight following work. No abstraction.",
  8: "No decisions. No actions taken. No moral resolution.",
  9: "No dramatization of aftermath. No explicit consequence statements.",
  10: "No summative explanation. No meaning statements. No closure language."
};

function generateSystemPrompt(chapter, deletionMode = false, customContext = '') {
  const techniques = CHAPTER_MAP[chapter] || {};
  const plotFunction = PLOT_FUNCTIONS[chapter] || '';
  const forbidden = FORBIDDEN[chapter] || '';
  
  const dominant = [];
  const active = [];
  const present = [];
  
  Object.entries(techniques).forEach(([code, level]) => {
    const name = TECHNIQUES[code];
    if (level === 3) dominant.push(name);
    else if (level === 2) active.push(name);
    else if (level === 1) present.push(name);
  });

  let prompt = `You are editing historical fiction using canonical experimental techniques. Your edits must be surgical and authoritative.

CHAPTER ${chapter} ARCHITECTURE:
${plotFunction}

TECHNIQUES FOR THIS CHAPTER:`;

  if (dominant.length) prompt += `\nDOMINANT (primary): ${dominant.join(', ')}`;
  if (active.length) prompt += `\nACTIVE (strong): ${active.join(', ')}`;
  if (present.length) prompt += `\nPRESENT (subtle): ${present.join(', ')}`;

  prompt += `

TECHNIQUE DEFINITIONS:
• Material Witness: Objects testify through wear/damage/persistence, NOT symbolism. NO interpretation.
• Polyphonic Possession: Multiple consciousnesses inhabit narrator without quotation marks/framing. NO reflection on possession.
• Negative Historiography: Meaning from gaps/erasure/missing docs. Name what's absent, don't fill it. NO exposition.
• Abjection as Knowledge: Understanding through bodily degradation. Sensation BEFORE thought. NO aestheticizing.
• Temporal Collapse: Multiple times in same sentence, no hierarchy. NO clear before/after. NO flashback framing.
• Labor as Ontology: Identity through repetitive physical work. Thought FROM action. NO metaphorical labor.
• Sensory Anchor Portal: Concrete sensation opens temporal layers involuntarily. NO "I remembered." NO explanation.

CRITICAL PRINCIPLE:
This plot is TECTONIC not DRAMATIC. Pressure replaces conflict. Contact replaces climax. Reverberation replaces resolution.
Do not add false drama. Do not create conflict where pressure suffices.

FORBIDDEN IN THIS CHAPTER:
${forbidden}`;

  if (deletionMode) {
    prompt += `

DELETION MODE ACTIVE:
If paragraph already conforms, improve by REMOVING excess explanation, softening emphasis, tightening sentences.
Do not add imagery or insight unless structurally necessary.`;
  }

  if (customContext) {
    prompt += `

ADDITIONAL CONTEXT:
${customContext}`;
  }

  prompt += `

OUTPUT FORMAT:
Provide exactly two sections:
ANALYSIS: (2-3 sentences only) What works, what needs adjustment, what failure modes to avoid
REWRITE: (the edited paragraph, no preamble, just the prose)`;

  return prompt;
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text, chapter = 1, deletionMode = false, customContext = '' } = JSON.parse(event.body);

    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const systemPrompt = generateSystemPrompt(parseInt(chapter), deletionMode, customContext);

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `ORIGINAL PARAGRAPH:\n${text}`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Claude API error: ${response.status}`,
          details: errorData
        })
      };
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse response
    const analysisMatch = content.match(/ANALYSIS:\s*(.+?)(?=\n\nREWRITE:)/s);
    const rewriteMatch = content.match(/REWRITE:\s*(.+)/s);

    const analysis = analysisMatch ? analysisMatch[1].trim() : 'Analysis not available';
    const editedText = rewriteMatch ? rewriteMatch[1].trim() : text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        edited_text: editedText,
        analysis: analysis,
        original_text: text,
        chapter: chapter,
        techniques_applied: Object.keys(CHAPTER_MAP[parseInt(chapter)] || {}).map(code => TECHNIQUES[code])
      })
    };

  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};