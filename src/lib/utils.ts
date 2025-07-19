import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//
export type FuncFirstParamType<T extends (...args: any) => any> =
  Parameters<T>[0];

export const createGenId = () => {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
};

export const isSSR = () => {
  return typeof window === "undefined" || typeof document === "undefined";
};
export interface CreateContextOptions {
  /**
   * If `true`, React will throw if context is `null` or `undefined`
   * In some cases, you might want to support nested context, so you can set it to `false`
   */
  strict?: boolean;
  errorMessage?: string;
  name?: string;
}

type CreateContextReturn<T> = [React.Provider<T>, () => T, React.Context<T>];

export function createContext<ContextType>(
  options: CreateContextOptions = {}
) {
  const {
    strict = true,
    errorMessage = "useContext must be inside a Provider with a value",
    name,
  } = options;

  const Context = React.createContext<ContextType | undefined>(undefined);

  Context.displayName = name;

  function useContext() {
    const context = React.useContext(Context);
    if (!context && strict) throw new Error(errorMessage);

    return context;
  }

  return [
    Context.Provider,
    useContext,
    Context,
  ] as CreateContextReturn<ContextType>;
}


export const preloadImage = (url: string) => {
  return new Promise((r) => {
    const newImgEl = document.createElement('img')
    newImgEl.addEventListener('load', async () => {
      r(true)
    })
    newImgEl.setAttribute('src', url) // Loads the image first before switching.
  })
}