"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface LandingNavbarProps {
    session: any; // Using any for now to avoid complex type matching from auth lib, can be refined later if needed
}


export function LandingNavbar({ session }: LandingNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled || isMenuOpen
                ? "bg-[#0f172a]/95 border-b border-gray-800 shadow-xl backdrop-blur-xl"
                : "bg-transparent border-transparent py-4"
                }`}
        >
            <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between w-full">
                {/* Logo */}
                <div className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare Logo"
                        width={48}
                        height={48}
                        className="rounded-xl shadow-lg transition-transform hover:rotate-3 duration-300"
                    />
                    <span className="text-2xl font-bold text-white tracking-tight">StreamShare</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden min-w-[50%] lg:flex items-center justify-center gap-10">
                    <a href="#recursos" className="group relative text-gray-300 hover:text-white font-medium transition-colors whitespace-nowrap py-2">
                        <span className="relative z-10 transition-transform group-hover:-translate-y-0.5 inline-block">Recursos</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                    </a>
                    <a href="#planos" className="group relative text-gray-300 hover:text-white font-medium transition-colors whitespace-nowrap py-2">
                        <span className="relative z-10 transition-transform group-hover:-translate-y-0.5 inline-block">Planos</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                    </a>
                    <a href="#faq" className="group relative text-gray-300 hover:text-white font-medium transition-colors whitespace-nowrap py-2">
                        <span className="relative z-10 transition-transform group-hover:-translate-y-0.5 inline-block">FAQ</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                    </a>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden lg:flex items-center gap-4">
                    {session ? (
                        <Link
                            href="/dashboard"
                            className="group relative px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/40 hover:-translate-y-0.5 whitespace-nowrap overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Painel
                                <Image src="/assets/icons/ui/user.svg" width={20} height={20} alt="User" className="opacity-80 group-hover:opacity-100 invert" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="group relative px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 whitespace-nowrap"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/login"
                                className="group relative px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/40 hover:-translate-y-0.5 whitespace-nowrap overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Começar Agora
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                </span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                >
                    <Image
                        src={isMenuOpen ? "/assets/icons/ui/close.svg" : "/assets/icons/ui/menu.svg"}
                        width={28}
                        height={28}
                        alt={isMenuOpen ? "Fechar" : "Menu"}
                        className="transition-transform duration-300 hover:scale-110"
                    />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) origin-top ${isMenuOpen ? "opacity-100 scale-y-100 max-h-[500px] visible" : "opacity-0 scale-y-95 max-h-0 invisible"}`}>
                <div className="p-6 flex flex-col gap-2">
                    <a
                        href="#recursos"
                        className="flex items-center justify-between text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all animate-slide-in-from-left stagger-1"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Recursos
                        <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </a>
                    <a
                        href="#planos"
                        className="flex items-center justify-between text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all animate-slide-in-from-left stagger-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Planos
                        <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </a>
                    <a
                        href="#faq"
                        className="flex items-center justify-between text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all animate-slide-in-from-left stagger-3"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        FAQ
                        <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </a>

                    <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-gray-800">
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="w-full text-center px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-900/50 transition-all text-lg flex items-center justify-center gap-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Image src="/assets/icons/ui/user.svg" width={24} height={24} alt="User" className="invert" />
                                Acessar Painel
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="w-full text-center px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all text-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href="/register"
                                    className="w-full text-center px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-900/50 transition-all text-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Começar Agora
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
