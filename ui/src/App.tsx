import { Navigate, Route, Routes } from "react-router";
import { Providers } from "./providers";
import { LeaksLayout } from "./components/leaks";
import { HomePage, LeaksPage, SubmitLeaksPage, LeakDetailsPage, DAOPage, BountiesPage, CreateBountyPage, BountyDetailsPage, SubmitBountyProofPage } from "./pages";
import { DAOAdminPage } from "./pages/dao-admin";
import { useAuthStore } from "./lib/auth-store";
import { Toaster } from "sonner";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";

function App() {
  const { loggedIn, setLoggedIn } = useAuthStore();

  const address = useCurrentAccount();

  useEffect(() => {
    if (address?.address) {
      setLoggedIn(true);
    }
  }, [address]);

  return (
    <>
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
          <Route path="admin" element={<DAOAdminPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
