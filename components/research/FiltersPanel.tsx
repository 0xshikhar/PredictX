import { ResponsiveCard, ResponsiveCardHeader, ResponsiveCardTitle, ResponsiveCardContent } from '@/components/molecule/responsive-card';
import { Filter, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  filters: {
    categories: string[];
    chains: number[];
    minRiskScore: number;
    maxRiskScore: number;
    minAPY: number;
    auditedOnly: boolean;
  };
  updateFilters: (filters: Partial<FiltersPanelProps['filters']>) => void;
  resetFilters: () => void;
  categories: string[];
  chains: number[];
  chainNames: { [key: number]: string };
}

export function FiltersPanel({ 
  filters, 
  updateFilters, 
  resetFilters, 
  categories, 
  chains, 
  chainNames 
}: FiltersPanelProps) {
  return (
    <ResponsiveCard variant="glass" size="md">
      <ResponsiveCardHeader withBorder>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <ResponsiveCardTitle>Filters</ResponsiveCardTitle>
          </div>
          <button 
            onClick={resetFilters}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-gray-800/50"
          >
            Reset
          </button>
        </div>
      </ResponsiveCardHeader>
      <ResponsiveCardContent>
        <div className="space-y-5">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Protocol Category</label>
            <select
              value={filters.categories[0] || ''}
              onChange={(e) => updateFilters({ categories: e.target.value ? [e.target.value] : [] })}
              className="w-full bg-gray-800/80 border border-gray-700/50 text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Chain Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Blockchain Network</label>
            <select
              value={filters.chains[0] || ''}
              onChange={(e) => updateFilters({ chains: e.target.value ? [parseInt(e.target.value, 10)] : [] })}
              className="w-full bg-gray-800/80 border border-gray-700/50 text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Networks</option>
              {chains.map(chainId => (
                <option key={chainId} value={chainId}>{chainNames[chainId]}</option>
              ))}
            </select>
          </div>

          {/* Risk Score Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-400">
                Maximum Risk Score
              </label>
              <span className="text-xs font-medium bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700/50">
                {filters.maxRiskScore.toFixed(1)}
              </span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.maxRiskScore}
                onChange={(e) => updateFilters({ maxRiskScore: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-800/80 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`,
                }}
              />
              <div className="w-full flex justify-between mt-1 text-[10px] text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Minimum APY Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-400">
                Minimum APY
              </label>
              <span className="text-xs font-medium bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700/50">
                {filters.minAPY.toFixed(1)}%
              </span>
            </div>
            <div className="pt-1">
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={filters.minAPY}
                onChange={(e) => updateFilters({ minAPY: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-800/80 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4f46e5 0%, #8b5cf6 50%, #a855f7 100%)`,
                }}
              />
            </div>
          </div>

          {/* Audited Only Filter */}
          <div className="pt-2">
            <div 
              className="flex items-center bg-gray-800/50 hover:bg-gray-800 p-2 rounded-lg cursor-pointer border border-gray-800/80 transition-colors"
              onClick={() => updateFilters({ auditedOnly: !filters.auditedOnly })}
            >
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center mr-2",
                filters.auditedOnly 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-700/80 border border-gray-600/50"
              )}>
                {filters.auditedOnly && <Check className="w-3 h-3" />}
              </div>
              <label className="text-sm cursor-pointer flex-1">
                Audited Protocols Only
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-1">
              Only show protocols with security audits
            </p>
          </div>

          <div className="pt-2">
            <button 
              onClick={resetFilters}
              className="w-full py-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 rounded-lg text-sm text-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-3 h-3" />
              Clear All Filters
            </button>
          </div>
        </div>
      </ResponsiveCardContent>
    </ResponsiveCard>
  );
}
