
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is deprecated and redirects to the root page which now handles joining.
export default function DeprecatedJoinPage() {
  const router = useRouter();

  useEffect(() => {
    // Preserve search params like ?ref=...
    const search = window.location.search;
    router.replace(`/${search}`);
  }, [router]);

  return null;
}
