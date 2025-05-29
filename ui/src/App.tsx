import { Navigate, Route, Routes } from "react-router";
import { Providers } from "./providers";
import { LeaksLayout } from "./components/leaks";
import { HomePage, LeaksPage, SubmitLeaksPage, LeakDetailsPage } from "./pages";
import { useAuthStore } from "./lib/auth-store";
import { Toaster } from "sonner";
import { useState } from "react";

function App() {
  const { loggedIn } = useAuthStore();
  return (
    <Providers>
      <Routes>
        <Route
          index
          element={loggedIn ? <Navigate to="/leaks" /> : <HomePage />}
        />
        <Route path="/leaks" element={<LeaksLayout />}>
          <Route index element={<LeaksPage />} />
          <Route path="submit" element={<SubmitLeaksPage />} />
          <Route path=":id" element={<LeakDetailsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </Providers>
  );
}

export default App;
