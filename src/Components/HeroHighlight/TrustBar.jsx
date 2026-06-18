export default function TrustBar() {
  const items = ['Verified curriculum', 'Zero hallucinations', '140K+ students'];
  return (
    <div className="flex items-center justify-center gap-3" aria-label="Trust signals">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-3">
          {i > 0 && <span style={{ color: '#d4d4d0', fontSize: 8 }} aria-hidden="true">●</span>}
          <span
            className="uppercase tracking-widest"
            style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#a8a29e', letterSpacing: '0.1em' }}
          >
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}
