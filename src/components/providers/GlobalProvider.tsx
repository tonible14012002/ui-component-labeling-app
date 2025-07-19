import { QueryProvider } from "./QueryProvider";
import { Toaster } from "@/components/ui/sonner";

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster />
      <QueryProvider>
        {children}
      </QueryProvider>
    </>
  );
};
