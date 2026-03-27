"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $WowheadPower?: { refreshLinks: () => void };
  }
}

/**
 * Call this after rendering new Wowhead links to refresh tooltips.
 */
export function useWowheadTooltips(deps: any[] = []) {
  useEffect(() => {
    // Small delay to let DOM update before refreshing tooltips
    const timer = setTimeout(() => {
      window.$WowheadPower?.refreshLinks();
    }, 100);
    return () => clearTimeout(timer);
  }, deps);
}

/**
 * Renders an item as a Wowhead tooltip link.
 * If itemId is provided, links to wowhead with hover tooltip.
 * Falls back to plain text if no itemId.
 */
export function WowheadItem({
  itemId,
  itemName,
  quality,
}: {
  itemId?: number | null;
  itemName: string;
  quality?: string | null;
}) {
  if (!itemId) {
    // No item ID — just show colored text
    const qualityClass = quality
      ? `quality-${quality.toLowerCase()}`
      : "quality-epic";
    return <span className={`font-medium ${qualityClass}`}>{itemName}</span>;
  }

  return (
    <a
      href={`https://www.wowhead.com/item=${itemId}`}
      target="_blank"
      rel="noopener noreferrer"
      data-wowhead={`item=${itemId}`}
      className="font-medium"
    >
      {itemName}
    </a>
  );
}
