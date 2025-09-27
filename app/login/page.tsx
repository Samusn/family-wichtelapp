"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/firebase/auth";
import "../background.css"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.push("/home"); 
    } catch (err) {
      setError("Login fehlgeschlagen");
    }
  };

  return (
    <div className="background min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="bg-white text-red-600 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

