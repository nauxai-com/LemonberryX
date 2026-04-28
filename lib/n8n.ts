export async function triggerN8n(action: string, payload?: Record<string, unknown>) {
  const base = process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook';
  const res = await fetch(`${base}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) throw new Error(`n8n webhook failed: ${res.statusText}`);
  return res.json().catch(() => ({ success: true }));
}
