import type { FilterState } from '../../lib/types'
import {
  IconX,
  IconGenderMale,
  IconGenderFemale,
  IconGenderBigender,
  IconAccessible,
  IconBabyCarriage,
  IconToiletPaper,
  IconDroplet,
  IconWash,
  IconCurrencyDollar,
  IconCurrencyDollarOff,
} from '@tabler/icons-react'

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  bathroomCount: number
}

export function FilterBar({ filters, onFiltersChange, bathroomCount }: FilterBarProps) {
  const activeFilterCount =
    filters.type.length +
    (filters.isAccessible ? 1 : 0) +
    (filters.hasBabyChanger ? 1 : 0) +
    (filters.hasPaper ? 1 : 0) +
    (filters.hasSoap ? 1 : 0) +
    (filters.hasSink ? 1 : 0) +
    (filters.isFree !== null ? 1 : 0)

  const toggleType = (type: "male" | "female" | "unisex") => {
    const newTypes = filters.type.includes(type) ? filters.type.filter((t) => t !== type) : [...filters.type, type]
    onFiltersChange({ ...filters, type: newTypes })
  }

  const clearFilters = () => {
    onFiltersChange({
      type: [],
      isAccessible: null,
      hasBabyChanger: null,
      hasPaper: null,
      hasSoap: null,
      hasSink: null,
      isFree: null,
    })
  }

  return (
    <div className="absolute top-4 left-0 right-0 z-30 px-3 pt-1 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterPill
          icon={<IconToiletPaper className="h-3.5 w-3.5" />}
          label={`${bathroomCount}`}
          isActive={false}
          onClick={() => {}}
          disabled
        />

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-colors border border-transparent shadow-sm"
          >
            <IconX className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}

        <FilterPill
          icon={<IconGenderMale className="h-3.5 w-3.5" />}
          label="Hombre"
          isActive={filters.type.includes("male")}
          onClick={() => toggleType("male")}
        />
        <FilterPill
          icon={<IconGenderFemale className="h-3.5 w-3.5" />}
          label="Mujer"
          isActive={filters.type.includes("female")}
          onClick={() => toggleType("female")}
        />
        <FilterPill
          icon={<IconGenderBigender className="h-3.5 w-3.5" />}
          label="Unisex"
          isActive={filters.type.includes("unisex")}
          onClick={() => toggleType("unisex")}
        />

        <FilterPill
          icon={<IconAccessible className="h-3.5 w-3.5" />}
          label="Accesible"
          isActive={filters.isAccessible === true}
          onClick={() => onFiltersChange({ ...filters, isAccessible: filters.isAccessible ? null : true })}
        />
        <FilterPill
          icon={<IconBabyCarriage className="h-3.5 w-3.5" />}
          label="Cambiador"
          isActive={filters.hasBabyChanger === true}
          onClick={() => onFiltersChange({ ...filters, hasBabyChanger: filters.hasBabyChanger ? null : true })}
        />
        <FilterPill
          icon={<IconToiletPaper className="h-3.5 w-3.5" />}
          label="Papel"
          isActive={filters.hasPaper === true}
          onClick={() => onFiltersChange({ ...filters, hasPaper: filters.hasPaper ? null : true })}
        />
        <FilterPill
          icon={<IconDroplet className="h-3.5 w-3.5" />}
          label="Jabón"
          isActive={filters.hasSoap === true}
          onClick={() => onFiltersChange({ ...filters, hasSoap: filters.hasSoap ? null : true })}
        />
        <FilterPill
          icon={<IconWash className="h-3.5 w-3.5" />}
          label="Lavamanos"
          isActive={filters.hasSink === true}
          onClick={() => onFiltersChange({ ...filters, hasSink: filters.hasSink ? null : true })}
        />

        <FilterPill
          icon={<IconCurrencyDollarOff className="h-3.5 w-3.5" />}
          label="Gratis"
          isActive={filters.isFree === true}
          onClick={() => onFiltersChange({ ...filters, isFree: filters.isFree === true ? null : true })}
        />
        <FilterPill
          icon={<IconCurrencyDollar className="h-3.5 w-3.5" />}
          label="De pago"
          isActive={filters.isFree === false}
          onClick={() => onFiltersChange({ ...filters, isFree: filters.isFree === false ? null : false })}
        />
      </div>
    </div>
  )
}

function FilterPill({
  icon,
  label,
  isActive,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium transition-all touch-manipulation shadow-sm border ${
        isActive
          ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25 border-transparent"
          : "bg-white/95 dark:bg-gray-900/95 backdrop-blur border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
      } ${disabled ? "cursor-default opacity-80" : ""}`}
    >
      {icon}
      {label}
    </button>
  )
}
