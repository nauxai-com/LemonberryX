'use client';

const blobs = [
  { color: '#8B5CF6', size: 900, top: '-20%',  left: '-15%',  delay: '0s'  },
  { color: '#EC4899', size: 750, top: '-10%',  right: '-15%', delay: '4s'  },
  { color: '#F97316', size: 600, top: '30%',   right: '-5%',  delay: '8s'  },
  { color: '#06B6D4', size: 700, bottom: '-20%', right: '10%', delay: '2s' },
  { color: '#A855F7', size: 550, bottom: '-10%', left: '-5%', delay: '6s'  },
  { color: '#F59E0B', size: 400, top: '45%',   left: '30%',   delay: '11s' },
];

export default function GradientBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          className="blob"
          style={{
            width: b.size,
            height: b.size,
            background: b.color,
            top: (b as any).top,
            left: (b as any).left,
            right: (b as any).right,
            bottom: (b as any).bottom,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}
