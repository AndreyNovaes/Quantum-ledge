/**
 * Scenario Selector - Quick access to test scenarios
 */

'use client';

import React, { useState } from 'react';
import { getAllScenarios, ScenarioType } from '@/lib/test-scenarios';
import { useRouter } from 'next/navigation';

export function ScenarioSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const scenarios = getAllScenarios();

  const handleScenarioChange = (scenarioKey: string) => {
    if (scenarioKey === 'none') {
      // Remove all params
      router.push(window.location.pathname);
    } else {
      // Set scenario param
      router.push(`${window.location.pathname}?scenario=${scenarioKey}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        data-testid="scenario-selector-button"
      >
        🎯 Test Scenarios
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900">Select Test Scenario</h3>
              <p className="text-xs text-gray-600 mt-1">
                Choose a scenario for predictable, deterministic testing
              </p>
            </div>

            <div className="py-2">
              {/* Normal Mode */}
              <button
                onClick={() => handleScenarioChange('none')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                data-testid="scenario-none"
              >
                <div className="font-semibold text-gray-900">Normal Mode</div>
                <div className="text-xs text-gray-600 mt-1">
                  Random volatile prices (no scenario)
                </div>
              </button>

              {/* Scenarios */}
              {scenarios.map((scenario) => (
                <button
                  key={scenario.key}
                  onClick={() => handleScenarioChange(scenario.key)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                  data-testid={`scenario-${scenario.key}`}
                >
                  <div className="font-semibold text-gray-900">{scenario.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{scenario.description}</div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> You can also use URL params like{' '}
                <code className="bg-white px-1 py-0.5 rounded text-xs">
                  ?scenario=bull_market
                </code>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
