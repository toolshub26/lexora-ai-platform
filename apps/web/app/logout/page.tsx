"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/features/auth";
export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
  async function signOut() {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  signOut();
}, [router]);

  return <p>Signing out...</p>;
}
