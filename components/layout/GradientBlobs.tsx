'use client';
const blobs = [
  { color: '#7C3AED', size: 600, top: '-10%', left: '-5%',  delay: '0s' },
  { color: '#D946EF', size: 500, top: '-5%',  right: '-10%', delay: '5s' },
  { color: '#06B6D4', size: 450, bottom: '-10%', right: '-5%', delay: '10s' },
  { color: '#F59E0B', size: 400, bottom: '-5%', left: '-10%', delay: '3s' },
  { color: '#10B981', size: 300, top: '40%',  right: '20%', delay: '7s' },
];
export default function GradientBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          className="blob"
          style={{
            width: b.size, height: b.size,
            background: b.color,
            top: b.top, left: (b as any).left, right: (b as any).right,
            bottom: (b as any).bottom,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}
