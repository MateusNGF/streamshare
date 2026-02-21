"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { Bell, Smartphone, Mail, Globe, Clock, MessageSquare, Zap } from "lucide-react";
import { ComingSoon } from "../ui/ComingSoon";

export default function NotificationsTab() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    // Mock states for the roadmap
    const [categorias, setCategorias] = useState({
        financeiro: true,
        assinaturas: true,
        grupos: false,
        suporte: true,
        convites: true,
        sistema: true
    });

    const [canais, setCanais] = useState({
        inApp: true,
        email: true,
        whatsapp: false
    });

    const [frequencia, setFrequencia] = useState("imediata"); // imediata, diaria, semanal

    const handleSave = async () => {
        setLoading(true);
        // Mock save delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
        toast.success("Preferências de notificação salvas (Mock)");
    };

    const body = (
        <div className="max-w-4xl space-y-8 pb-8">
            <div className="border-b pb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-400" />
                    Preferências de Notificações
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Escolha como e quando você deseja ser notificado sobre as atividades da sua conta.
                </p>
            </div>

            {/* Canal Selection */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Canais de Recebimento
                </h4>
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Bell className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Aplicativo (In-App)</h5>
                                <p className="text-xs text-gray-500 mt-0.5">Notificações no sino superior da plataforma.</p>
                            </div>
                        </div>
                        <Switch
                            id="inApp"
                            checked={canais.inApp}
                            onCheckedChange={(checked) => setCanais(prev => ({ ...prev, inApp: checked }))}
                        />
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">Email</h5>
                                <p className="text-xs text-gray-500 mt-0.5">Resumos e alertas críticos por email.</p>
                            </div>
                        </div>
                        <Switch
                            id="email"
                            checked={canais.email}
                            onCheckedChange={(checked) => setCanais(prev => ({ ...prev, email: checked }))}
                        />
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                <MessageSquare className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-gray-900">WhatsApp</h5>
                                <p className="text-xs text-gray-500 mt-0.5">Mensagens diretas no seu número verificado.</p>
                            </div>
                        </div>
                        <Switch
                            id="whatsapp"
                            checked={canais.whatsapp}
                            onCheckedChange={(checked) => setCanais(prev => ({ ...prev, whatsapp: checked }))}
                        />
                    </div>
                </div>
            </div>

            {/* Categorias */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Categorias
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Financeiro & Cobranças</span>
                            <p className="text-[11px] text-gray-500">Pagamentos, faturas, atrasos.</p>
                        </div>
                        <Switch
                            id="financeiro"
                            checked={categorias.financeiro}
                            onCheckedChange={(checked) => setCategorias(prev => ({ ...prev, financeiro: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Assinaturas</span>
                            <p className="text-[11px] text-gray-500">Suspensões, renovações, inclusões.</p>
                        </div>
                        <Switch
                            id="assinaturas"
                            checked={categorias.assinaturas}
                            onCheckedChange={(checked) => setCategorias(prev => ({ ...prev, assinaturas: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Grupos & Streamings</span>
                            <p className="text-[11px] text-gray-500">Alterações no catálogo ou senhas.</p>
                        </div>
                        <Switch
                            id="grupos"
                            checked={categorias.grupos}
                            onCheckedChange={(checked) => setCategorias(prev => ({ ...prev, grupos: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Convites</span>
                            <p className="text-[11px] text-gray-500">Solicitações de entrada e links.</p>
                        </div>
                        <Switch
                            id="convites"
                            checked={categorias.convites}
                            onCheckedChange={(checked) => setCategorias(prev => ({ ...prev, convites: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Suporte</span>
                            <p className="text-[11px] text-gray-500">Status dos seus tickets abertos.</p>
                        </div>
                        <Switch
                            id="suporte"
                            checked={categorias.suporte}
                            onCheckedChange={(checked) => setCategorias(prev => ({ ...prev, suporte: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Sistema</span>
                            <p className="text-[11px] text-gray-500">Avisos de alterações na conta.</p>
                        </div>
                        <Switch
                            id="sistema"
                            checked={categorias.sistema}
                            onCheckedChange={(checked) => setCategorias(prev => ({ ...prev, sistema: checked }))}
                        />
                    </div>
                </div>
            </div>

            {/* Frequência */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Frequência de Envio (Email/WhatsApp)
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                    {[
                        { id: 'imediata', label: 'Imediata', desc: 'No momento do evento' },
                        { id: 'diaria', label: 'Diária', desc: 'Resumo às 09:00' },
                        { id: 'semanal', label: 'Semanal', desc: 'Resumo às segundas' }
                    ].map(freq => (
                        <button
                            key={freq.id}
                            onClick={() => setFrequencia(freq.id)}
                            className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${frequencia === freq.id
                                ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                                : "border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                        >
                            <span className={`text-sm font-semibold mb-1 ${frequencia === freq.id ? "text-primary" : "text-gray-700"}`}>
                                {freq.label}
                            </span>
                            <span className="text-[11px] text-gray-500 text-center">
                                {freq.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto min-w-[140px]">
                    {loading ? "Salvando..." : "Salvar Preferências"}
                </Button>
            </div>
        </div>
    );

    return (
        <ComingSoon
            title="Em breve"
            description="Estamos preparando um novo centro de notificações inteligente."
            tags={["WhatsApp", "Email", "SMS", "Telegram", "Discord"]}
        />
    )
}
