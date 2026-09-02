"use client";

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedValue(value),
      Math.max(0, delay),
    );

    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

