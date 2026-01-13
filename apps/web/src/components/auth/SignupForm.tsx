"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Chrome } from "lucide-react";

export function SignupForm() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
        if (!acceptTerms) {
            alert("Você deve aceitar os termos e condições!");
            return;
        }
        console.log("Signup:", { nome, email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Nome completo"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="João Silva"
                required
            />
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
            <Input
                label="Confirmar senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
            />

            <label className="flex items-start gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 text-primary rounded mt-1"
                    required
                />
                <span className="text-sm text-gray-600">
                    Eu aceito os termos e condições e a política de privacidade
                </span>
            </label>

            <button
                type="submit"
                className="w-full bg-primary hover:bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
            >
                Criar conta
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
