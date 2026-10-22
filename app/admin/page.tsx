"use client";

import { useState, useEffect } from "react";
import {
  verifyAdminPassword,
  checkAdminSession,
  logoutAdmin,
} from "@/app/actions/admin";
import { KeyRound, LoaderCircle } from "lucide-react";
import SessionOverview from "./SessionOverview";
import Button from "@components/ui/Button";
import Card, { CardTitle } from "@components/ui/Card";
import Input from "@components/ui/Input";
import Page from "@components/ui/Page";

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
      <Page className="items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-gold" aria-label="Laden" />
      </Page>
    );
  }

  if (!authenticated) {
    return (
      <Page className="justify-center">
        <Card as="form" onSubmit={handleLogin} className="flex flex-col gap-4">
          <CardTitle icon={<KeyRound className="w-5 h-5" aria-hidden />}>
            Admin-Zugang
          </CardTitle>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            autoFocus
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit">Anmelden</Button>
        </Card>
      </Page>
    );
  }

  return <SessionOverview onLogout={handleLogout} />;
}
