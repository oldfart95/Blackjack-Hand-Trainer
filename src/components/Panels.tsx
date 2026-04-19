import type { Scenario, SessionStats } from '../types';
import { recommendedMode, topLeakTags } from '../engine/selectors';

export const CoachPanel = ({ scenario }: { scenario: Scenario }) => (
  <section className="panel">
    <h3>Coach Panel</h3>
    <div>Hand type: {scenario.handClass}</div>
    <div>Total: {scenario.playerTotal}</div>
    <div>Dealer bucket: {scenario.dealerBucket}</div>
  </section>
);

export const ProgressPanel = ({ stats }: { stats: SessionStats }) => (
  <section className="panel">
    <h3>Live Leaks</h3>
    {topLeakTags(stats, 6).length === 0 ? <div>No misses yet.</div> : null}
    <ul>
      {topLeakTags(stats, 6).map((item) => (
        <li key={item.tag}>
          {item.tag.replaceAll('_', ' ')}: {item.count}
        </li>
      ))}
    </ul>
  </section>
);

export const SessionSummary = ({ stats }: { stats: SessionStats }) => {
  const top3 = topLeakTags(stats, 3);
  return (
    <section className="panel summary">
      <h3>Session Summary</h3>
      <div>
        Top 3 leaks:{' '}
        {top3.length > 0
          ? top3.map((l) => `${l.tag.replaceAll('_', ' ')} (${l.count})`).join(' · ')
          : 'none yet'}
      </div>
      <div>
        Recommended next mode: <strong>{recommendedMode(stats)}</strong>
      </div>
      <div>Correction note: Drill top leak mode with adaptive pressure enabled for 25 hands.</div>
    </section>
  );
};
