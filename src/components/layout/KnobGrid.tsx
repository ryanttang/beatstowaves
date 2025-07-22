import React from 'react';
import Knob from '../Knob';

interface KnobGridProps {
  noise: number;
  setNoise: (n: number) => void;
  wobble: number;
  setWobble: (n: number) => void;
  distort: number;
  setDistort: (n: number) => void;
  digital: number;
  setDigital: (n: number) => void;
  space: number;
  setSpace: (n: number) => void;
  magnetic: number;
  setMagnetic: (n: number) => void;
  theme: string;
}

const KnobGrid: React.FC<KnobGridProps> = ({
  noise, setNoise,
  wobble, setWobble,
  distort, setDistort,
  digital, setDigital,
  space, setSpace,
  magnetic, setMagnetic,
  theme
}) => (
  <div
    className="grid grid-cols-2 gap-y-6 gap-x-6 items-center mt-0"
    style={{ maxHeight: '1350px' }}
  >
    <Knob value={typeof noise === 'number' ? noise : 0.5} onChange={setNoise} label="NOISE" color={String('#e07a3f')} theme={String(theme)} />
    <Knob value={typeof wobble === 'number' ? wobble : 0.5} onChange={setWobble} label="WOBBLE" color={String('#e6c15c')} theme={String(theme)} />
    <Knob value={typeof distort === 'number' ? distort : 0.5} onChange={setDistort} label="DISTORT" color={String('#4bbf8b')} theme={String(theme)} />
    <Knob value={typeof digital === 'number' ? digital : 0.5} onChange={setDigital} label="DIGITAL" color={String('#3bb6b0')} theme={String(theme)} />
    <Knob value={typeof space === 'number' ? space : 0.5} onChange={setSpace} label="SPACE" color={String('#4a90e2')} theme={String(theme)} />
    <Knob value={typeof magnetic === 'number' ? magnetic : 0.5} onChange={setMagnetic} label="MAGNETIC" color={String('#23253a')} theme={String(theme)} />
  </div>
);

export default KnobGrid; 