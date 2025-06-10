import { Navigate, Route, Routes } from "react-router";
import { Providers } from "./providers";
import { LeaksLayout } from "./components/leaks";
import { HomePage, LeaksPage, SubmitLeaksPage, LeakDetailsPage, DAOPage, BountiesPage, CreateBountyPage, BountyDetailsPage, SubmitBountyProofPage } from "./pages";
import { useAuthStore } from "./lib/auth-store";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useAccounts, useCurrentAccount } from "@mysten/dapp-kit";

function App() {
  const { loggedIn, setLoggedIn } = useAuthStore();

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
        <Route path="/bounties" element={<LeaksLayout />}>
          <Route index element={<BountiesPage />} />
          <Route path="create" element={<CreateBountyPage />} />
          <Route path=":id" element={<BountyDetailsPage />} />
          <Route path=":id/submit" element={<SubmitBountyProofPage />} />
        </Route>
        <Route path="/dao" element={<LeaksLayout />}>
          <Route index element={<DAOPage />} />
        </Route>
      </Routes>
      <Toaster />
    </Providers>
  );
}

export default App;
