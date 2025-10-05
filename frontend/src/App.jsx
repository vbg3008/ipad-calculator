import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./components/Home";

// Initialize React Query client
const queryClient = new QueryClient();

// Define routes
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
]);

const App = () => {
  return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
  );
};

export default App;
