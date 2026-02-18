"use client";

import { ScrollText, AlertTriangle, FileCheck } from "lucide-react";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalTableOfContents } from "@/components/legal/LegalTableOfContents";
import { LegalSection } from "@/components/legal/LegalSection";

export default function TermosDeUsoPage() {
    const lastUpdate = "16 de Fevereiro de 2026";

    const tocItems = [
        { id: "resumo", label: "00. Disposições Iniciais" },
        { id: "definicoes", label: "01. Glossário e Definições" },
        { id: "aceitacao", label: "02. Adesão e Vigência" },
        { id: "organizadores", label: "03. Deveres do Organizador" },
        { id: "participantes", label: "04. Deveres do Participante" },
        { id: "fairplay", label: "05. Código de Conduta" },
        { id: "financeiro", label: "06. Gestão de Fluxo" },
        { id: "responsabilidade", label: "07. Limitação de Nexo" },
        { id: "bloqueios", label: "08. Políticas de Terceiros" },
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24 font-sans selection:bg-primary/10">
            <LegalHeader
                title="Termos e Condições de Uso"
                subtitle={`Atualizado em ${lastUpdate} • Instrumento Jurídico`}
                badgeText="Contrato de Adesão"
                badgeIcon={ScrollText}
                otherLinkText="Política de Privacidade"
                otherLinkHref="/politica-de-privacidade"
            />

            <div className="container mx-auto px-6 max-w-3xl">
                <LegalTableOfContents items={tocItems} />

                <article className="space-y-24">
                    <LegalSection
                        id="resumo"
                        title="Resumo Executivo"
                        isHighlighted
                    >
                        <div className="space-y-4 font-medium italic text-gray-600">
                            <p>
                                O StreamShare constitui uma plataforma tecnológica de intermediação organizacional, não comercializando, sob hipótese alguma, acesso a conteúdos proprietários de terceiros.
                            </p>
                            <p>
                                Aos <strong>Organizadores</strong>: A titularidade e responsabilidade contratual perante os serviços de streaming subsistem integralmente sob sua alçada exclusiva.
                            </p>
                            <p>
                                Aos <strong>Participantes</strong>: O adimplemento pontual das obrigações financeiras é condição <em>sine qua non</em> para a manutenção da fruição do serviço organizado.
                            </p>
                        </div>
                    </LegalSection>

                    <LegalSection
                        id="definicoes"
                        index="01"
                        title="Termos e Definições"
                    >
                        <div className="space-y-8">
                            {[
                                { term: "Kota (Cota)", def: "Unidade técnica de acesso correspondente a um perfil individual em um grupo de compartilhamento sob gestão da plataforma." },
                                { term: "Streaming de Catálogo", def: "Serviços de provimento de conteúdo (ex: Netflix, Spotify) operados por terceiros sem vínculo jurídico com o StreamShare." },
                                { term: "Membro Extra", def: "Funcionalidade oficial de determinadas plataformas para inclusão de beneficiários externos ao domicílio principal." },
                                { term: "Gateway", def: "Entidade financeira responsável pelo processamento e liquidação das transações pecuniárias entre usuários." }
                            ].map((item, i) => (
                                <div key={i} className="border-b border-gray-50 pb-6 last:border-0">
                                    <strong className="text-gray-900 block mb-2">{item.term}</strong>
                                    <p className="text-gray-500 m-0 leading-relaxed">{item.def}</p>
                                </div>
                            ))}
                        </div>
                    </LegalSection>

                    <LegalSection
                        id="aceitacao"
                        index="02"
                        title="Adesão Irretratável"
                    >
                        <p>
                            A utilização, cadastro ou acesso a quaisquer funcionalidades do <strong>StreamShare</strong> formaliza um contrato vinculativo entre o Usuário e a Plataforma. A manifestação de concordância eletrônica possui plena eficácia jurídica, sendo o silêncio ou a continuidade do uso interpretados como anuência tácita aos presentes Termos.
                        </p>
                    </LegalSection>

                    <LegalSection
                        id="organizadores"
                        index="03"
                        title="Deveres do Organizador"
                    >
                        <ul className="space-y-6 list-none pl-0">
                            <li>
                                <strong className="text-gray-900 block mb-1">Titularidade Primária</strong>
                                O Organizador declara ser o titular legítimo e responsável financeiro originário pela assinatura compartilhada.
                            </li>
                            <li>
                                <strong className="text-gray-900 block mb-1">Compliance Contratual</strong>
                                É dever do Organizador assegurar que o compartilhamento de logins respeite rigorosamente as diretrizes do provedor final de conteúdo.
                            </li>
                            <li>
                                <strong className="text-gray-900 block mb-1">Manutenção de Credenciais</strong>
                                O Organizador obriga-se a manter os dados de acesso devidamente atualizados no sistema, sob pena de suspensão da conta.
                            </li>
                        </ul>
                    </LegalSection>

                    <LegalSection
                        id="participantes"
                        index="04"
                        title="Deveres do Participante"
                    >
                        <ul className="space-y-6 list-none pl-0">
                            <li>
                                <strong className="text-gray-900 block mb-1">Pagamento Tempestivo</strong>
                                O Participante compromete-se com a liquidação pontual das faturas geradas, ciente de que o atraso implica em suspensão imediata.
                            </li>
                            <li>
                                <strong className="text-gray-900 block mb-1">Intransferibilidade</strong>
                                As credenciais de acesso são de uso privativo do Participante, sendo expressamente vedada a sublocação ou cessão a terceiros.
                            </li>
                        </ul>
                    </LegalSection>

                    <LegalSection
                        id="financeiro"
                        index="06"
                        title="Gestão de Fluxo e Inadimplência"
                    >
                        <p>
                            A arquitetura da Plataforma opera sob monitoramento automatizado de fluxo financeiro. Faturas não liquidadas em até <strong>24 horas após o vencimento</strong> acarretarão a alteração sistêmica do status para inadimplente, autorizando o bloqueio técnico das credenciais até a purgação da mora.
                        </p>
                    </LegalSection>

                    <LegalSection
                        id="responsabilidade"
                        index="07"
                        title="Limitação de Responsabilidade"
                    >
                        <div className="bg-red-50/50 border-l-4 border-red-500 p-8 rounded-r-2xl my-8">
                            <h4 className="text-red-900 font-bold mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                Cláusula de Isenção de Nexo
                            </h4>
                            <p className="text-red-800 m-0 leading-relaxed italic">
                                "O StreamShare não ostenta qualquer responsabilidade civil ou criminal por interrupções, bloqueios ou suspensões de contas impostos pelos provedores originais de streaming em decorrência de políticas de compartilhamento de senhas."
                            </p>
                        </div>
                    </LegalSection>

                    <LegalSection
                        id="bloqueios"
                        index="08"
                        title="Políticas de Terceiros e 'Crackdown'"
                    >
                        <p>
                            As plataformas de conteúdo reservam-se o direito de implementar restrições técnicas (e.g., geo-blocking, verificação de IP) de forma unilateral. O StreamShare não garante a perenidade da fruição caso ocorram mudanças estruturais nas políticas de acesso dos provedores originais.
                        </p>
                    </LegalSection>

                    <section id="contato" className="pt-12 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Central de Atendimento Jurídico</h2>
                        <p className="mb-8">
                            Para esclarecimentos referentes ao presente instrumento ou notificações legais, solicitamos o contato exclusivo via correio eletrônico institucional:
                        </p>
                        <a
                            href="mailto:atendimento@streamshare.com.br"
                            className="inline-block px-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black hover:bg-primary transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-sm md:text-base"
                        >
                            atendimento@streamshare.com.br
                        </a>
                    </section>
                </article>

                <div className="mt-32 pb-16 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em]">
                        StreamShare Institutional Legal Framework © 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
