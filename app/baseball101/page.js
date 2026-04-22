'use client';
import ModulePage from '@/components/shared/ModulePage';
import AiStrategyModule from '@/components/shared/AiStrategyModule';

export default function Baseball101Page() {
  return (
    <ModulePage title="Baseball 101">
      <AiStrategyModule title="Baseball 101" focus="fantasy baseball fundamentals and advanced metrics" icon="🎓" />
    </ModulePage>
  );
}
