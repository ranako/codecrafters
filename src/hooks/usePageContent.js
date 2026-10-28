import { createContext, useContext } from "react";
import { defaultPageContent } from "../lib/pageContentSchema";
export const PageContentContext = createContext(defaultPageContent);
export function usePageContent(page) {
  return useContext(PageContentContext)[page] || defaultPageContent[page];
}
