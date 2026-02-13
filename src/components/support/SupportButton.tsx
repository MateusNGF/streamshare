"use client";

import { useState, useTransition, useEffect } from "react";
import { HelpCircle, MessageCircleQuestion, Send, Clock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createReport, SuporteInput } from "@/actions/suporte";
import { TicketHistoryTable } from "./TicketHistoryTable";
import { useToast } from "@/contexts/ToastContext";

export function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    const [formData, setFormData] = useState<SuporteInput>({
        nome: "",
        email: "",
        assunto: "",
        descricao: "",
    });

    useEffect(() => {
        // Tenta buscar os dados do usuário se estiver logado
        // Como este é um componente cliente, podemos tentar fazer uma server action para pegar a sessão
        // ou mais simples: passar os dados como prop se disponível no layout
        // Mas para simplificar e funcionar standalone, vamos fazer uma chamada rápida

        const loadUser = async () => {
            // Esta lógica idealmente viria de um hook useUser() ou contexto de auth
            // Mas vamos criar uma server action simples para recuperar o usuário atual
            // ou usar uma rota de API. 
            // Como não temos um endpoint API pronto para 'me', vamos criar uma action auxiliar
            // no suporte.ts para pegar o user atual.
            try {
                const { getCurrentUserAction } = await import("@/actions/suporte");
                const user = await getCurrentUserAction();
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        nome: user.nome || "",
                        email: user.email || ""
                    }));
                }
            } catch (error) {
                // Silently fail if not logged in
            }
        };

        if (isOpen) {
            loadUser();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await createReport(formData);
            if (result.success) {
                showToast(
                    "success",
                    "Recebemos sua mensagem e entraremos em contato em breve."
                );
                setIsOpen(false);
                setFormData({ nome: "", email: "", assunto: "", descricao: "" });
            } else {
                showToast(
                    "error",
                    "Não foi possível enviar seu report. Tente novamente."
                );
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-40 group animate-in fade-in zoom-in slide-in-from-bottom-5"
                aria-label="Suporte"
            >
                <HelpCircle size={28} className="group-hover:rotate-12 transition-transform" />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Central de Ajuda"
                className="sm:max-w-2xl"
                footer={
                    activeTab === 'new' ? (
                        <div className="flex gap-3 w-full">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="support-form"
                                className="flex-[2] shadow-lg shadow-primary/25"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        Enviar Mensagem
                                        <Send size={18} className="ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => setActiveTab('new')}
                        >
                            <MessageCircleQuestion size={18} className="mr-2" />
                            Abrir Novo Chamado
                        </Button>
                    )
                }
            >
                <div className="space-y-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as 'new' | 'history')}
                        tabs={[
                            {
                                id: 'new',
                                label: 'Nova Mensagem',
                                icon: MessageCircleQuestion,
                                content: (
                                    <div className="space-y-6">
                                        <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex gap-3 text-violet-900">
                                            <div className="bg-violet-100 p-2 rounded-xl h-fit">
                                                <MessageCircleQuestion size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm mb-1">Como podemos ajudar?</h4>
                                                <p className="text-sm text-violet-700/80 leading-relaxed">
                                                    Encontrou um problema ou tem uma sugestão? Preencha os campos abaixo.
                                                </p>
                                            </div>
                                        </div>

                                        <form id="support-form" onSubmit={handleSubmit} className="space-y-4">
                                            <Input
                                                label="Seu Nome"
                                                name="nome"
                                                placeholder="Como você gostaria de ser chamado?"
                                                value={formData.nome}
                                                onChange={handleChange}
                                                required
                                                disabled={isPending}
                                            />

                                            <Input
                                                label="E-mail de Contato"
                                                name="email"
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                disabled={isPending}
                                            />

                                            <Input
                                                label="Assunto"
                                                name="assunto"
                                                placeholder="Sobre o que é o contato?"
                                                value={formData.assunto}
                                                onChange={handleChange}
                                                required
                                                disabled={isPending}
                                            />

                                            <Textarea
                                                label="Descrição Detalhada (Mín. 50 caracteres)"
                                                name="descricao"
                                                placeholder={`Descreva o que aconteceu detalhadamente.
                
                Exemplo ideal:
                "Ao tentar aceitar o convite da assinatura Netflix, cliquei no botão 'Aceitar' e nada aconteceu.
                Tentei atualizar a página, mas o problema persistiu.
                Erro exibido: 'Falha ao processar a solicitação'."`}
                                                value={formData.descricao}
                                                onChange={handleChange}
                                                required
                                                minLength={50}
                                                disabled={isPending}
                                                className="min-h-[250px]"
                                            />
                                        </form>
                                    </div>
                                )
                            },
                            {
                                id: 'history',
                                label: 'Meus Chamados',
                                icon: Clock,
                                content: (
                                    <div className="min-h-[300px]">
                                        <TicketHistoryTable />
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </Modal>
        </>
    );
}
