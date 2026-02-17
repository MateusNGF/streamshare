"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Lock, Eye, FileText, ScrollText } from "lucide-react";

export default function PoliticaDePrivacidadePage() {
    const router = useRouter();

    const lastUpdate = "16 de Fevereiro de 2026";

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24 font-sans selection:bg-primary/10">
            {/* Elegant Header / Navigation */}
            <div className="container mx-auto px-6 max-w-3xl mb-16">
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-all"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Retornar
                    </button>

                    <a
                        href="/termos-de-uso"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
                    >
                        Termos de Uso
                    </a>
                </div>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <Shield size={12} className="text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Documento Oficial</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        Política de <span className="text-primary">Privacidade</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        Vigência a partir de {lastUpdate} • Revisão 2.1
                    </p>
                </div>
            </div>

            {/* Main Document Content */}
            <div className="container mx-auto px-6 max-w-3xl">
                <article className="prose prose-gray max-w-none">
                    <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2rem] shadow-sm mb-16 leading-relaxed text-justify text-gray-600">
                        <h2 className="text-xl font-bold text-gray-900 mt-0 mb-4">Compromisso Institucional</h2>
                        <p className="m-0 italic">
                            O StreamShare reitera seu compromisso inegociável com a integridade e confidencialidade dos dados pessoais de seus usuários. O presente documento delineia, com transparência e rigor, as diretrizes de coleta, tratamento e armazenamento de informações, em estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                        </p>
                    </div>

                    <div className="space-y-20 text-gray-700 leading-loose text-justify font-normal">
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-950 text-white text-sm font-bold">01</span>
                                Natureza da Coleta de Dados
                            </h2>
                            <p className="mb-6">
                                A coleta de dados operada por esta plataforma restringe-se ao mínimo indispensável para a viabilização técnica e jurídica dos serviços de gestão de compartilhamento. Entendemos que a privacidade é a regra, e a coleta, a exceção justificada pela necessidade operacional.
                            </p>
                            <div className="grid gap-6">
                                {[
                                    { label: "Identificação Civil", desc: "Nome completo, inscrição no CPF e data de nascimento, requeridos para a validação de identidade e conformidade com as normas vigentes." },
                                    { label: "Canais de Comunicação", desc: "Endereço de e-mail e número de telefone móvel (vinculado ao serviço WhatsApp), essenciais para comunicações de segurança e transacionais." },
                                    { label: "Registros de Utilização", desc: "Metadados de acesso, logs de interação com a interface e histórico de comunicações geradas automaticamente pelo sistema." },
                                    { label: "Histórico Financeiro", desc: "Registros de adimplemento e status de validade das assinaturas ativas sob a gestão do usuário." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform" />
                                        <div>
                                            <strong className="text-gray-900 block text-base mb-1">{item.label}</strong>
                                            <p className="text-gray-500 m-0 leading-relaxed text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-950 text-white text-sm font-bold">02</span>
                                Finalidade e Base Legal
                            </h2>
                            <p>
                                O tratamento de dados pessoais realizado pelo StreamShare fundamenta-se na execução contratual e no legítimo interesse, garantindo que cada bit de informação possua uma finalidade específica e legítima.
                            </p>
                            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Comunicações via WhatsApp</h3>
                            <p>
                                O número de telefone móvel é processado exclusivamente para a execução de automações críticas, as quais são configuradas pelo usuário através do módulo <code>WhatsAppConfig</code>. Tais operações incluem comunicações preventivas de vencimento, confirmações de liquidação financeira e alertas de segurança.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-950 text-white text-sm font-bold">03</span>
                                Segurança e Processamento Financeiro
                            </h2>
                            <p>
                                Adotamos uma arquitetura de segurança baseada no princípio de <em>Zero Trust</em> para dados financeiros sensíveis.
                            </p>
                            <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-8 rounded-r-2xl my-8">
                                <p className="text-emerald-900 m-0 font-medium italic">
                                    "Ratificamos que o StreamShare não armazena em sua infraestrutura própria quaisquer dados sensíveis de pagamento, como numeração integral de cartões ou códigos CVV. O processamento é delegado a entidades certificadas PCI-DSS, operando sob o sigilo bancário."
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">04. Compartilhamento de Informações</h2>
                            <p>
                                A cessão de dados a terceiros é estritamente vedada, salvaguardadas as hipóteses de interação necessária entre os membros de um mesmo grupo de compartilhamento (exposição restrita ao Nome e Status Financeiro) e o cumprimento de requisições judiciais exaradas por autoridades competentes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">05. Direitos do Titular</h2>
                            <p>
                                Em estrita observância à LGPD, asseguramos aos nossos usuários o direito de acesso, retificação, anonimização ou exclusão definitiva de seus dados. Para o exercício de tais prerrogativas, disponibilizamos o canal direto com o nosso Encarregado de Proteção de Dados:
                            </p>
                            <div className="mt-8 flex justify-center">
                                <a
                                    href="mailto:privacidade@streamshare.com.br"
                                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-lg"
                                >
                                    privacidade@streamshare.com.br
                                </a>
                            </div>
                        </section>
                    </div>

                    <div className="mt-32 pt-12 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-[0.3em]">
                            StreamShare • Proteção e Transparência
                        </p>
                    </div>
                </article>
            </div>
        </div>
    );
}
