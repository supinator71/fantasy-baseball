'use client';
import ModulePage from '@/components/shared/ModulePage';
import AiStrategyModule from '@/components/shared/AiStrategyModule';

export default function TradeFinderPage() {
  return (
    <ModulePage title="Trade Finder">
      <AiStrategyModule title="Trade Finder" focus="identifying trade targets and league partners" icon="🔍" />
    </ModulePage>
  );
}
