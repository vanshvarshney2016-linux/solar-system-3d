import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

// SolarSystemScene is built in the next wave; App shell is ready to host it.
const SolarSystemScene = lazy(() => import("@/pages/SolarSystemScene"));

function LoadingScreen() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 fade-in">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
          <div className="absolute inset-1 rounded-full border border-accent/20 animate-spin [animation-direction:reverse] [animation-duration:3s]" />
        </div>
        <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
          Initialising Solar System…
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="fixed inset-0 overflow-hidden bg-background"
        style={{ colorScheme: "dark" }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <SolarSystemScene />
        </Suspense>
      </div>
    </QueryClientProvider>
  );
}
