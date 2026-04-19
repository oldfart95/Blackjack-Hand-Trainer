import type { Action } from '../types';

const actions: Array<{ action: Action; hotkey: string; label: string }> = [
  { action: 'hit', hotkey: 'H', label: 'Hit' },
  { action: 'stand', hotkey: 'S', label: 'Stand' },
  { action: 'double', hotkey: 'D', label: 'Double' },
  { action: 'split', hotkey: 'P', label: 'Split' },
  { action: 'surrender', hotkey: 'R', label: 'Surrender' },
];

type Props = {
  onChoose: (action: Action) => void;
  disabled: boolean;
};

export const ActionButtons = ({ onChoose, disabled }: Props) => (
  <div className="actions">
    {actions.map((item) => (
      <button key={item.action} disabled={disabled} onClick={() => onChoose(item.action)}>
        {item.label} <kbd>{item.hotkey}</kbd>
      </button>
    ))}
  </div>
);
