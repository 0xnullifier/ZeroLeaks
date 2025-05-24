import React from "react";
import { ThemeProvider } from "./components/zk-login/theme-provider";
import { BrowserRouter } from "react-router";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
  );
};

export default Providers;
