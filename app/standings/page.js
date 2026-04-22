'use client';
import ModulePage from '@/components/shared/ModulePage';
import AiStrategyModule from '@/components/shared/AiStrategyModule';

export default function StandingsPage() {
  return (
    <ModulePage title="League Standings">
      <AiStrategyModule title="Standings" focus="current league ranking and seasonal trajectory" icon="📊" />
    </ModulePage>
  );
}
