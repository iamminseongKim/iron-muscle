import React, { useState } from 'react';
import { X, Search, Dumbbell, ChevronRight } from 'lucide-react';
import { Exercise, Category, EquipmentType } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise, equipmentType: EquipmentType, brand?: string) => void;
}

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'chest', label: '가슴' },
  { id: 'back', label: '등' },
  { id: 'legs', label: '하체' },
  { id: 'shoulders', label: '어깨' },
  { id: 'arms', label: '팔' },
  { id: 'core', label: '복근/코어' },
];

const EQUIPMENTS: { id: EquipmentType | 'all'; label: string }[] = [
  { id: 'all', label: '모든 장비' },
  { id: 'barbell', label: '바벨' },
  { id: 'dumbbell', label: '덤벨' },
  { id: 'machine', label: '머신' },
  { id: 'cable', label: '케이블' },
  { id: 'bodyweight', label: '맨몸' },
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');

  if (!isOpen) return null;

  const filteredExercises = EXERCISES_DATABASE.filter((ex) => {
    // 검색어 필터링
    const matchQuery =
      searchQuery.trim() === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

    // 카테고리 필터링
    const matchCat = selectedCategory === 'all' || ex.category === selectedCategory;

    // 장비 필터링
    const matchEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;

    return matchQuery && matchCat && matchEquip;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141721] border border-gray-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-[#141721]">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
              <Dumbbell size={18} className="text-red-400" />
              운동 종목 선택
            </h3>
            <p className="text-xs text-gray-400">총 {EXERCISES_DATABASE.length}종의 풍부한 운동 라이브러리</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* 검색창 */}
        <div className="p-3 border-b border-gray-800 bg-[#0F121A] space-y-2.5">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="운동명 검색 (예: 스쿼트, 벤치, 레그익스텐션, 로우...)"
              className="w-full bg-[#1A1E2C] text-sm text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2 border border-gray-800 focus:outline-none focus:border-red-500 transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                지우기
              </button>
            )}
          </div>

          {/* 카테고리 칩 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-[#FF334B] text-white shadow-md'
                    : 'bg-[#1C2030] text-gray-400 hover:text-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* 장비 필터 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
            {EQUIPMENTS.map((eq) => (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedEquipment(eq.id)}
                className={`px-2.5 py-0.5 rounded-lg font-semibold whitespace-nowrap transition border ${
                  selectedEquipment === eq.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#161A26] text-gray-400 border-gray-800 hover:border-gray-700'
                }`}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>

        {/* 운동 목록 */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              검색 결과가 없습니다. 다른 검색어를 입력해 보세요.
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  onSelect(ex, ex.equipment, ex.defaultBrand);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl bg-[#181C2A] hover:bg-[#1F2538] border border-gray-800 hover:border-red-500/50 transition flex items-center justify-between group"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-sm text-white group-hover:text-red-400 transition">
                      {ex.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-gray-400">
                      {ex.equipment === 'machine' ? '머신' : ex.equipment === 'barbell' ? '바벨' : ex.equipment === 'dumbbell' ? '덤벨' : '맨몸/케이블'}
                    </span>
                    {ex.defaultBrand && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[10px] font-semibold">
                        {ex.defaultBrand.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
                    <span className="text-red-400 font-semibold">
                      주동: {ex.primaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo.split(' ')[0] || m).join(', ')}
                    </span>
                    {ex.secondaryMuscles.length > 0 && (
                      <span className="text-gray-500">
                        | 협응: {ex.secondaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo.split(' ')[0] || m).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#121520] group-hover:bg-red-500/20 text-gray-400 group-hover:text-red-400 transition">
                  <ChevronRight size={16} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
