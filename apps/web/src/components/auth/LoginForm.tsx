"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Chrome } from "lucide-react";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login:", { email, password, rememberMe });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
            />
            <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
            />

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-600">Lembrar-me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-accent font-medium">
                    Esqueci minha senha
                </a>
            </div>

            <button
                type="submit"
                className="w-full bg-primary hover:bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
            >
                Entrar
            </button>

            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-primary text-gray-700 py-4 rounded-xl font-bold transition-all"
            >
                <Chrome size={20} />
                Continuar com Google
            </button>
        </form>
    );
}
