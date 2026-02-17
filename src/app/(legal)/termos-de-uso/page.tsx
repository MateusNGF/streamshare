"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ScrollText, AlertTriangle, HelpCircle, FileCheck, Shield } from "lucide-react";

export default function TermosDeUsoPage() {
    const router = useRouter();

    const lastUpdate = "16 de Fevereiro de 2026";

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

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
                        href="/politica-de-privacidade"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
                    >
                        Política de Privacidade
                    </a>
                </div>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <ScrollText size={12} className="text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Contrato de Adesão</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        Termos e Condições <span className="text-primary">de Uso</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        Atualizado em {lastUpdate} • Instrumento Jurídico
                    </p>
                </div>
            </div>

            {/* Main Document Content */}
            <div className="container mx-auto px-6 max-w-3xl">
                {/* Subtle Table of Contents */}
                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 mb-20 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <FileCheck size={14} className="text-primary" />
                        Sumário Executivo
                    </h3>
                    <nav className="grid md:grid-cols-2 gap-x-12 gap-y-3">
                        {[
                            { id: "resumo", label: "00. Disposições Iniciais" },
                            { id: "definicoes", label: "01. Glossário e Definições" },
                            { id: "aceitacao", label: "02. Adesão e Vigência" },
                            { id: "organizadores", label: "03. Deveres do Organizador" },
                            { id: "participantes", label: "04. Deveres do Participante" },
                            { id: "fairplay", label: "05. Código de Conduta" },
                            { id: "financeiro", label: "06. Gestão de Fluxo" },
                            { id: "responsabilidade", label: "07. Limitação de Nexo" },
                            { id: "bloqueios", label: "08. Políticas de Terceiros" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-left text-sm font-semibold text-gray-500 hover:text-primary transition-colors py-1 flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-gray-200 group-hover:bg-primary transition-colors" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <article className="prose prose-gray max-w-none text-gray-700 leading-loose text-justify space-y-24">

                    <section id="resumo" className="bg-primary/[0.02] border-y border-primary/5 py-12 px-6 rounded-3xl">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Resumo Executivo</h2>
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
                    </section>

                    <section id="definicoes">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-950 text-white text-sm font-bold">01</span>
                            Termos e Definições
                        </h2>
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
                    </section>

                    <section id="aceitacao">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-950 text-white text-sm font-bold">02</span>
                            Adesão Irretratável
                        </h2>
                        <p>
                            A utilização, cadastro ou acesso a quaisquer funcionalidades do <strong>StreamShare</strong> formaliza um contrato vinculativo entre o Usuário e a Plataforma. A manifestação de concordância eletrônica possui plena eficácia jurídica, sendo o silêncio ou a continuidade do uso interpretados como anuência tácita aos presentes Termos.
                        </p>
                    </section>

                    <section id="organizadores">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">03. Deveres do Organizador</h2>
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
                    </section>

                    <section id="participantes">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">04. Deveres do Participante</h2>
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
                    </section>

                    <section id="financeiro">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">06. Gestão de Fluxo e Inadimplência</h2>
                        <p>
                            A arquitetura da Plataforma opera sob monitoramento automatizado de fluxo financeiro. Faturas não liquidadas em até <strong>24 horas após o vencimento</strong> acarretarão a alteração sistêmica do status para inadimplente, autorizando o bloqueio técnico das credenciais até a purgação da mora.
                        </p>
                    </section>

                    <section id="responsabilidade">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">07. Limitação de Responsabilidade</h2>
                        <div className="bg-red-50/50 border-l-4 border-red-500 p-8 rounded-r-2xl my-8">
                            <h4 className="text-red-900 font-bold mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                Cláusula de Isenção de Nexo
                            </h4>
                            <p className="text-red-800 m-0 leading-relaxed italic">
                                "O StreamShare não ostenta qualquer responsabilidade civil ou criminal por interrupções, bloqueios ou suspensões de contas impostos pelos provedores originais de streaming em decorrência de políticas de compartilhamento de senhas."
                            </p>
                        </div>
                    </section>

                    <section id="bloqueios">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">08. Políticas de Terceiros e "Crackdown"</h2>
                        <p>
                            As plataformas de conteúdo reservam-se o direito de implementar restrições técnicas (e.g., geo-blocking, verificação de IP) de forma unilateral. O StreamShare não garante a perenidade da fruição caso ocorram mudanças estruturais nas políticas de acesso dos provedores originais.
                        </p>
                    </section>

                    <section id="contato" className="pt-12 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Central de Atendimento Jurídico</h2>
                        <p className="mb-8">
                            Para esclarecimentos referentes ao presente instrumento ou notificações legais, solicitamos o contato exclusivo via correio eletrônico institucional:
                        </p>
                        <a
                            href="mailto:atendimento@streamshare.com.br"
                            className="inline-block px-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black hover:bg-primary transition-all shadow-xl hover:-translate-y-1 active:scale-95"
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
