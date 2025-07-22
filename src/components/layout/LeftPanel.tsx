import React from 'react';
import UploadPanel from '../UploadPanel';
import { ButtonSVG } from '../KnobSVG';

interface LeftPanelProps {
  setEditingOption: (option: string | null) => void;
  handleExportClick: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ setEditingOption, handleExportClick }) => (
  <div className="flex flex-col justify-between items-center w-[160px] h-full" style={{ maxHeight: '1350px' }}>
    {/* Top: UploadPanel */}
    <div className="flex justify-center self-center mx-auto" style={{ width: '140px' }}>
      <UploadPanel />
    </div>
    {/* Spacer to push buttons to bottom */}
    <div className="flex-1" />
    {/* Bottom: Editing option buttons */}
    <div className="flex flex-col gap-4 items-center justify-end w-full mb-2">
      <ButtonSVG src="/knobs/button-orange.svg" label="COLOR" width="140" height="48" onClick={() => setEditingOption('color')} />
      <ButtonSVG src="/knobs/button-yellow.svg" label="SIZE" width="140" height="48" onClick={() => setEditingOption('size')} />
      <ButtonSVG src="/knobs/button-lime.svg" label="SHAPE" width="140" height="48" onClick={() => setEditingOption('shape')} />
      <ButtonSVG src="/knobs/button-lightblue.svg" label="COUNT" width="140" height="48" onClick={() => setEditingOption('count')} />
      <ButtonSVG src="/knobs/button-blue.svg" label="LIGHTING" width="140" height="48" onClick={() => setEditingOption('lighting')} />
      <ButtonSVG src="/knobs/button-purple.svg" label="BACKGROUND" width="140" height="48" onClick={() => setEditingOption('background')} />
    </div>
    {/* New: 2x2 grid of black buttons below left side buttons */}
    <div className="flex justify-center items-center mb-4">
      <div className="grid grid-cols-2 gap-2 justify-items-center max-w-[150px] mx-auto">
        <ButtonSVG src="/knobs/black-button.svg" label="LOAD" width="70" height="28" />
        <ButtonSVG src="/knobs/black-button.svg" label="SAVE" width="70" height="28" />
        <ButtonSVG src="/knobs/black-button.svg" label="PRESET" width="70" height="28" />
        <ButtonSVG src="/knobs/black-button.svg" label="EXPORT" width="70" height="28" onClick={handleExportClick} />
      </div>
    </div>
  </div>
);

export default LeftPanel; 