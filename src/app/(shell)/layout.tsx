import type { ReactNode } from "react";

import { AppHeader } from "@/components/shell/header";
import { StatusLine } from "@/components/shell/status-line";
import { TabBar } from "@/components/shell/tab-bar";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <TabBar />
      <StatusLine />
      {children}
    </>
  );
}
