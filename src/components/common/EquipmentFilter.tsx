import React from 'react';
import { t } from '../../i18n';
import { EquipmentType } from '../../types/workout';
import { EQUIPMENT_FILTERS } from '../../utils/equipment';
export function EquipmentFilter({ value, onChange, machinesOnly = false }: { value: EquipmentType | 'all'; onChange: (value: EquipmentType | 'all') => void; machinesOnly?: boolean }) {
  return <div className="flex flex-wrap gap-1.5" aria-label={t('장비')}>
    {EQUIPMENT_FILTERS.filter(option => !machinesOnly || ['all', 'machine', 'smith', 'cable'].includes(option.id)).map(option =>
      <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)}
        className={'px-3 py-2 rounded-xl text-xs font-bold ' + (value === option.id ? 'bg-[#0F766E] text-white' : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-500')}>
        {t(option.label)}
      </button>)}
  </div>;
}
