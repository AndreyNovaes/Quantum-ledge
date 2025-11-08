/**
 * Select component
 */

import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  'data-testid'?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  className,
  options,
  'data-testid': testId,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white',
          error ? 'border-danger' : 'border-gray-300',
          className
        )}
        data-testid={testId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-danger" data-testid={`${testId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
