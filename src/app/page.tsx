import { redirect } from "next/navigation";

import { DEFAULT_TAB, hrefForTab } from "@/lib/nav";

export default function Root() {
  redirect(hrefForTab(DEFAULT_TAB));
}
