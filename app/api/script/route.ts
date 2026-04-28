import { NextRequest, NextResponse } from 'next/server';
import { anthropic, SCRIPT_SYSTEM_PROMPT, AB_SYSTEM_PROMPT } from '@/lib/claude';

export async function POST(req: NextRequest) {
  const { topic, keyPoints, type } = await req.json();

  if (type === 'ab') {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: AB_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Generate 3 AB title variants for: "${topic}"` }],
    });
    const text = (msg.content[0] as any).text;
    try {
      const variants = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
      return NextResponse.json({ variants });
    } catch {
      return NextResponse.json({ variants: { curiosity: topic, fear: topic, result: topic } });
    }
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SCRIPT_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Write a full retention-engineered YouTube script for Grimm Archives.\n\nTopic: ${topic}\n${keyPoints ? `Key points: ${keyPoints}` : ''}`,
    }],
  });

  const script = (msg.content[0] as any).text;
  return NextResponse.json({ script });
}
