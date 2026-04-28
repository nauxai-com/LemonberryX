import { NextRequest, NextResponse } from 'next/server';
import { anthropic, COMPLY_SYSTEM_PROMPT } from '@/lib/claude';

export async function POST(req: NextRequest) {
  const { script, title } = await req.json();

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: COMPLY_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Analyze this YouTube script for compliance.\n${title ? `Title: ${title}\n` : ''}Script:\n${script}`,
    }],
  });

  const text = (msg.content[0] as any).text;
  try {
    const result = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ score: 5, originality: 1, production: 2, policy: 2, flags: ['Parse error'], recommendations: [], pass: false });
  }
}
