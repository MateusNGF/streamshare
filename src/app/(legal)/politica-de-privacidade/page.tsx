"use client";

import { Shield, LucideIcon } from "lucide-react";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalSection } from "@/components/legal/LegalSection";

export default function PoliticaDePrivacidadePage() {
    const lastUpdate = "16 de Fevereiro de 2026";

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24 font-sans selection:bg-primary/10">
            <LegalHeader
                title="Política de Privacidade"
                subtitle={`Vigência a partir de ${lastUpdate} • Revisão 2.1`}
                badgeText="Documento Oficial"
                badgeIcon={Shield}
                otherLinkText="Termos de Uso"
                otherLinkHref="/termos-de-uso"
            />

            <div className="container mx-auto px-6 max-w-3xl">
                <article className="space-y-20">
                    <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2rem] shadow-sm mb-16 leading-relaxed text-justify text-gray-600">
                        <h2 className="text-xl font-bold text-gray-900 mt-0 mb-4">Compromisso Institucional</h2>
                        <p className="m-0 italic">
                            O StreamShare reitera seu compromisso inegociável com a integridade e confidencialidade dos dados pessoais de seus usuários. O presente documento delineia, com transparência e rigor, as diretrizes de coleta, tratamento e armazenamento de informações, em estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                        </p>
                    </div>

                    <LegalSection
                        id="coleta"
                        index="01"
                        title="Natureza da Coleta de Dados"
                    >
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
                    </LegalSection>

                    <LegalSection
                        id="finalidade"
                        index="02"
                        title="Finalidade e Base Legal"
                    >
                        <p>
                            O tratamento de dados pessoais realizado pelo StreamShare fundamenta-se na execução contratual e no legítimo interesse, garantindo que cada bit de informação possua uma finalidade específica e legítima.
                        </p>
                        <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4 border-l-2 border-primary pl-4">Comunicações via WhatsApp</h3>
                        <p>
                            O número de telefone móvel é processado exclusivamente para a execução de automações críticas, as quais são configuradas pelo usuário através do módulo <code>WhatsAppConfig</code>. Tais operações incluem comunicações preventivas de vencimento, confirmações de liquidação financeira e alertas de segurança.
                        </p>
                    </LegalSection>

                    <LegalSection
                        id="seguranca"
                        index="03"
                        title="Segurança e Processamento Financeiro"
                    >
                        <p>
                            Adotamos uma arquitetura de segurança baseada no princípio de <em>Zero Trust</em> para dados financeiros sensíveis.
                        </p>
                        <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-8 rounded-r-2xl my-8">
                            <p className="text-emerald-900 m-0 font-medium italic">
                                "Ratificamos que o StreamShare não armazena em sua infraestrutura própria quaisquer dados sensíveis de pagamento, como numeração integral de cartões ou códigos CVV. O processamento é delegado a entidades certificadas PCI-DSS, operando sob o sigilo bancário."
                            </p>
                        </div>
                    </LegalSection>

                    <LegalSection
                        id="compartilhamento"
                        index="04"
                        title="Compartilhamento de Informações"
                    >
                        <p>
                            A cessão de dados a terceiros é estritamente vedada, salvaguardadas as hipóteses de interação necessária entre os membros de um mesmo grupo de compartilhamento (exposição restrita ao Nome e Status Financeiro) e o cumprimento de requisições judiciais exaradas por autoridades competentes.
                        </p>
                    </LegalSection>

                    <LegalSection
                        id="direitos"
                        index="05"
                        title="Direitos do Titular"
                    >
                        <p>
                            Em estrita observância à LGPD, asseguramos aos nossos usuários o direito de acesso, retificação, anonimização ou exclusão definitiva de seus dados. Para o exercício de tais prerrogativas, disponibilizamos o canal direto com o nosso Encarregado de Proteção de Dados:
                        </p>
                        <div className="mt-8 flex justify-center">
                            <a
                                href="mailto:privacidade@streamshare.com.br"
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-lg text-sm md:text-base"
                            >
                                privacidade@streamshare.com.br
                            </a>
                        </div>
                    </LegalSection>

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
