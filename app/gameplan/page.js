'use client';
import ModulePage from '@/components/shared/ModulePage';
import AiStrategyModule from '@/components/shared/AiStrategyModule';

export default function GameplanPage() {
  return (
    <ModulePage title="Weekly Gameplan">
      <AiStrategyModule title="Gameplan" focus="matchup preparation and streaming rotation" icon="📅" />
    </ModulePage>
  );
}
