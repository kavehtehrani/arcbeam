"use client";

import { useState, useRef, useEffect } from "react";
import { ChainConfig } from "@/lib/chains";
import { getChainLogoPath } from "@/lib/chainLogos";
import Image from "next/image";

interface ChainSelectProps {
  value: ChainConfig;
  onChange: (chain: ChainConfig) => void;
  options: ChainConfig[];
  disabled?: boolean;
  label: string;
}

export default function ChainSelect({
  value,
  onChange,
  options,
  disabled = false,
  label,
}: ChainSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedLogoPath = getChainLogoPath(value.name);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-gray-400 dark:disabled:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          {selectedLogoPath ? (
            <Image
              src={selectedLogoPath}
              alt={value.name}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          )}
          <span className="flex-1">{value.name}</span>
          <svg
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-60 overflow-auto py-1">
            {options.map((chain) => {
              const logoPath = getChainLogoPath(chain.name);
              return (
                <button
                  key={chain.chainId}
                  type="button"
                  onClick={() => {
                    onChange(chain);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    value.chainId === chain.chainId
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {logoPath ? (
                      <Image
                        src={logoPath}
                        alt={chain.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    )}
                    <span>{chain.name}</span>
                    {value.chainId === chain.chainId && (
                      <svg
                        className="ml-auto h-4 w-4 text-gray-600 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

