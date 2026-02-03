"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface LandingNavbarProps {
    session: any; // Using any for now to avoid complex type matching from auth lib, can be refined later if needed
}

export function LandingNavbar({ session }: LandingNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
            <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare Logo"
                        width={48}
                        height={48}
                        className="rounded-xl"
                    />
                    <span className="text-2xl font-bold text-gray-900">StreamShare</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    <a href="#recursos" className="text-gray-600 hover:text-primary font-medium transition-colors whitespace-nowrap">
                        Recursos
                    </a>
                    <a href="#planos" className="text-gray-600 hover:text-primary font-medium transition-colors whitespace-nowrap">
                        Planos
                    </a>
                    <a href="#faq" className="text-gray-600 hover:text-primary font-medium transition-colors whitespace-nowrap">
                        FAQ
                    </a>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden lg:flex items-center gap-4">
                    {session ? (
                        <Link
                            href="/dashboard"
                            className="px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all whitespace-nowrap"
                        >
                            Painel
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="px-6 py-2 text-gray-700 font-bold hover:text-primary transition-all whitespace-nowrap"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all whitespace-nowrap"
                            >
                                Começar Agora
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-gray-600 hover:text-primary focus:outline-none"
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <a
                        href="#recursos"
                        className="text-lg font-medium text-gray-700 hover:text-primary py-2 border-b border-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Recursos
                    </a>
                    <a
                        href="#planos"
                        className="text-lg font-medium text-gray-700 hover:text-primary py-2 border-b border-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Planos
                    </a>
                    <a
                        href="#faq"
                        className="text-lg font-medium text-gray-700 hover:text-primary py-2 border-b border-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        FAQ
                    </a>

                    <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-gray-100">
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="w-full text-center px-6 py-4 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all text-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Acessar Painel
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="w-full text-center px-6 py-4 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all text-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
