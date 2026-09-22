import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import SocketProvider from "@context/SocketProvider.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#21262d",
                color: "#e6edf3",
                border: "1px solid #30363d",
                borderRadius: "6px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#3fb950",
                  secondary: "#21262d",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f85149",
                  secondary: "#21262d",
                },
              },
            }}
          />
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
