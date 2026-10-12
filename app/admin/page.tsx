"use client";

import { useState, useEffect } from "react";
import {
  verifyAdminPassword,
  checkAdminSession,
  logoutAdmin,
} from "@/app/actions/admin";
import SessionOverview from "./SessionOverview";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminSession().then((valid) => {
      setAuthenticated(valid);
      setChecking(false);
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await verifyAdminPassword(password);
    if (result.success) {
      setAuthenticated(true);
      setError("");
      setPassword("");
    } else {
      setError(result.error ?? "Fehler.");
    }
  }

  async function handleLogout() {
    await logoutAdmin();
    setAuthenticated(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Laden...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="bg-white/10 backdrop-blur rounded-xl p-8 w-full max-w-sm flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold text-white text-center">
            Admin Zugang
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            className="rounded-lg px-4 py-3 bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-lg transition"
          >
            Anmelden
          </button>
        </form>
      </div>
    );
  }

  return <SessionOverview onLogout={handleLogout} />;
}
