/** Consistent anatomy glyphs; highlighted area identifies the target, without emoji metaphors. */
export function BodyPartIcon({ part }: { part: string }) {
  const regions: Record<string, string> = {
    chest: 'M16 19 L23 20 V27 L17 26 Z M25 20 L32 19 L31 26 L25 27 Z',
    back: 'M16 19 L23 22 L23 34 L19 31 Z M25 22 L32 19 L29 31 L25 34 Z',
    legs: 'M18 35 H23 L22 48 L20 57 H17 L18 47 Z M25 35 H30 V47 L31 57 H28 L26 48 Z',
    shoulders: 'M14 18 L18 17 L18 23 L12 26 Z M30 17 L34 18 L36 26 L30 23 Z',
    biceps: 'M12 26 L17 24 L16 33 L11 35 Z M31 24 L36 26 L37 35 L32 33 Z',
    triceps: 'M12 24 L16 25 L14 35 L10 35 Z M32 25 L36 24 L38 35 L34 35 Z',
    core: 'M20 28 H23 V37 H20 Z M25 28 H28 V37 H25 Z',
    fullbody: 'M15 18 L23 20 V37 H18 L16 26 L12 34 L10 33 Z M25 20 L33 18 L38 33 L36 34 L32 26 L30 37 H25 Z M18 39 H23 L21 57 H17 Z M25 39 H30 L31 57 H27 Z',
  };
  return <svg viewBox="0 0 48 64" className="w-8 h-10" aria-hidden="true" fill="none">
    <circle cx="24" cy="9" r="5" stroke="currentColor" strokeWidth="1.6" opacity=".45"/>
    <path d="M20 15 L15 17 Q12 18 11 23 L7 39 L10 41 L16 28 L18 36 L16 58 L21 59 L24 41 L27 59 L32 58 L30 36 L32 28 L38 41 L41 39 L37 23 Q36 18 33 17 L28 15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity=".45"/>
    <path d={regions[part] || regions.fullbody} fill="currentColor"/>
    {(part === 'back' || part === 'triceps') && <path d="M24 18 V36" stroke="currentColor" strokeWidth="1" opacity=".4"/>}
  </svg>;
}
