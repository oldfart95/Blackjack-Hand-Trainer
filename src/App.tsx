import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import { ActionButtons } from './components/ActionButtons';
import { CoachPanel, ProgressPanel, SessionSummary } from './components/Panels';
import { getScenarioWeight, updateAdaptiveProfile, weightedPick } from './engine/adaptive';
import { buildScenarioBank } from './engine/scenarioBank';
import { filterByMode } from './engine/selectors';
import { applyAttempt, emptySessionStats } from './engine/session';
import { loadAdaptive, loadSettings, loadStats, saveAdaptive, saveSettings, saveStats } from './engine/storage';
import type { Action, Scenario } from './types';

const drillModes = [
  ['mixed', 'Full mixed'],
  ['hard_only', 'Hard only'],
  ['soft_only', 'Soft only'],
  ['pairs_only', 'Pairs only'],
  ['trouble_hands', 'Trouble hands'],
  ['exam', 'Exam mode'],
  ['missed_only', 'Missed only'],
] as const;

function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [stats, setStats] = useState(loadStats);
  const [adaptive, setAdaptive] = useState(loadAdaptive);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [presentedAt, setPresentedAt] = useState(Date.now());

  const scenarioBank = useMemo(() => buildScenarioBank(settings.preset), [settings.preset]);
  const filteredScenarios = useMemo(
    () => filterByMode(scenarioBank, settings.drillMode, stats.missedScenarioIds),
    [scenarioBank, settings.drillMode, stats.missedScenarioIds],
  );

  const [current, setCurrent] = useState<Scenario>(() => filteredScenarios[0]);

  const nextScenario = () => {
    const pool = filteredScenarios.length > 0 ? filteredScenarios : scenarioBank;
    const selected = weightedPick(pool, (item) => getScenarioWeight(item, adaptive, settings.adaptiveEnabled));
    setCurrent(selected);
    setFeedback(null);
    setShowHint(false);
    setPresentedAt(Date.now());
  };

  useEffect(() => {
    if (!current) nextScenario();
  }, [current]);

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveStats(stats), [stats]);
  useEffect(() => saveAdaptive(adaptive), [adaptive]);

  const handleAnswer = (chosenAction: Action) => {
    if (feedback || !current) return;
    const { next, leakTagsTriggered } = applyAttempt(stats, current, chosenAction, presentedAt);
    setStats(next);
    setAdaptive((prev) => updateAdaptiveProfile(prev, current, leakTagsTriggered));

    const result = chosenAction === current.correctAction ? '✅ Correct' : '❌ Incorrect';
    setFeedback(
      `${result}. Correct action: ${current.correctAction.toUpperCase()} · ${current.bucketLabel}. ${current.explanationShort}`,
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const map: Record<string, Action> = { h: 'hit', s: 'stand', d: 'double', p: 'split', r: 'surrender' };
      if (k === 'n') nextScenario();
      if (map[k] && !feedback) handleAnswer(map[k]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const isExam = settings.drillMode === 'exam';

  if (!current) return null;

  return (
    <main className="app">
      <header>
        <h1>Blackjack Basic Strategy Drill Trainer</h1>
        <p>Study tool for memorization drills. No betting, no gameplay simulation.</p>
      </header>

      <section className="toolbar panel">
        <label>
          Mode
          <select
            value={settings.drillMode}
            onChange={(e) => setSettings((prev) => ({ ...prev, drillMode: e.target.value as typeof prev.drillMode }))}
          >
            {drillModes.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.adaptiveEnabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, adaptiveEnabled: e.target.checked }))}
          />
          Adaptive pressure
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.showCoachPanel}
            onChange={(e) => setSettings((prev) => ({ ...prev, showCoachPanel: e.target.checked }))}
          />
          Coach panel
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.showProgressPanel}
            onChange={(e) => setSettings((prev) => ({ ...prev, showProgressPanel: e.target.checked }))}
          />
          Leak panel
        </label>
      </section>

      <section className="table panel">
        <div className="cards">
          <div>
            <h2>Dealer upcard</h2>
            <div className="card">{current.dealerUpcard}</div>
          </div>
          <div>
            <h2>Your hand</h2>
            <div className="card-row">
              <div className="card">{current.playerCards[0]}</div>
              <div className="card">{current.playerCards[1]}</div>
            </div>
          </div>
        </div>
        {(settings.revealHandLabel || showHint) && (
          <div className="subtle">
            {current.handClass.toUpperCase()} {current.playerTotal} · Dealer {current.dealerBucket}
          </div>
        )}
        {!isExam && feedback ? <div className="feedback">{feedback}</div> : null}
        {isExam && feedback ? <div className="feedback">Saved. Press N for next hand.</div> : null}

        <ActionButtons onChoose={handleAnswer} disabled={Boolean(feedback)} />

        <div className="row">
          <button onClick={nextScenario}>Next <kbd>N</kbd></button>
          {settings.learnMode && settings.showHints && !showHint && !feedback ? (
            <button onClick={() => setShowHint(true)}>Hint</button>
          ) : null}
          {!feedback && (
            <button
              onClick={() => {
                const draft = {
                  settings,
                  stats,
                  adaptive,
                };
                navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
              }}
            >
              Export JSON
            </button>
          )}
          <button
            onClick={() => {
              setStats(emptySessionStats());
              setAdaptive({ leakWeights: {}, scenarioMistakes: {} });
            }}
          >
            Reset session
          </button>
          <button
            onClick={() => {
              if (stats.missedScenarioIds.length === 0) return;
              const missId = stats.missedScenarioIds[0];
              const scenario = scenarioBank.find((s) => s.id === missId);
              if (scenario) {
                setCurrent(scenario);
                setFeedback(null);
                setPresentedAt(Date.now());
              }
            }}
          >
            Drill mistake again
          </button>
        </div>
      </section>

      <section className="stats panel">
        <h3>Session Stats</h3>
        <div className="stats-grid">
          <div>Hands: {stats.handsSeen}</div>
          <div>Accuracy: {stats.accuracy.toFixed(1)}%</div>
          <div>Streak: {stats.currentStreak}</div>
          <div>Best streak: {stats.bestStreak}</div>
        </div>
      </section>

      <section className="side-grid">
        {settings.showCoachPanel ? <CoachPanel scenario={current} /> : null}
        {settings.showProgressPanel ? <ProgressPanel stats={stats} /> : null}
      </section>

      <SessionSummary stats={stats} />

      <footer className="subtle">Keyboard: H/S/D/P/R to answer, N for next.</footer>
    </main>
  );
}

export default App;
