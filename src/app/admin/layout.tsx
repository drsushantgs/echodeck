// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const isAdmin = user?.email === "dr.sushantgsharma@gmail.com";

      if (!user || !isAdmin) {
        router.replace("/auth");
      } else {
        setAllowed(true);
      }
      setChecking(false);
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return <div className="p-6 text-center">Checking access...</div>;
  }

  return allowed ? <>{children}</> : null;
}