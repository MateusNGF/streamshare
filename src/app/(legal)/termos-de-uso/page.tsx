"use client";

import { useRouter } from "next/navigation";

export default function TermosDeUsoPage() {
    const router = useRouter();

    const lastUpdate = "23 de Janeiro de 2026";

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-6 max-w-4xl bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="text-primary hover:underline mb-8 inline-block flex items-center gap-2"
                >
                    &larr; Voltar
                </button>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
                <p className="text-gray-500 mb-8">Última atualização: {lastUpdate}</p>

                <div className="prose prose-blue max-w-none text-gray-600 space-y-8">

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                        <p className="font-semibold text-blue-900 m-0">Resumo "Mastigado" (Para quem tem pressa)</p>
                        <p className="text-blue-800 text-sm mt-2 m-0">
                            Nós somos uma ferramenta de <strong>organização</strong>. Não vendemos contas de Netflix, Spotify ou qualquer outra. Nós ajudamos você a organizar seu grupo de amigos ou família para dividir os custos.
                            <br /><br />
                            Se você é <strong>Organizador</strong>: A conta do serviço é sua responsabilidade. Se pararem de pagar, a dívida com o serviço é sua. Use nossa plataforma para cobrar automaticamente.
                            <br />
                            Se você é <strong>Participante</strong>: Pague em dia para não perder acesso. Não compartilhe a senha com estranhos.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Aceitação dos Termos</h2>
                        <p>
                            Bem-vindo ao <strong>StreamShare</strong> ("Plataforma"). Ao criar uma conta, acessar ou utilizar qualquer parte dos nossos serviços, você concorda expressamente com estes Termos de Uso ("Termos").
                        </p>
                        <p className="mt-2 text-sm bg-gray-50 p-3 rounded border border-gray-100 italic">
                            <strong>O que isso significa:</strong> Ao usar o StreamShare, você assina este contrato digital. Se não concordar, infelizmente não poderá usar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">2. O Que é o StreamShare?</h2>
                        <p>
                            O StreamShare é uma plataforma de gestão financeira e organizacional para grupos de compartilhamento de assinaturas ("Kotas").
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li><strong>Não somos provedores de conteúdo:</strong> Não transmitimos filmes, músicas ou jogos.</li>
                            <li><strong>Não vendemos contas:</strong> Não comercializamos logins ou senhas de terceiros.</li>
                            <li><strong>Não temos vínculo oficial:</strong> Não somos afiliados à Netflix, Spotify, Youtube, etc.</li>
                        </ul>
                        <p className="mt-4">
                            Nossa função é puramente administrativa: fornecer ferramentas para que um <strong>Organizador</strong> possa gerenciar os pagamentos e o acesso de seus <strong>Participantes</strong> convidados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Cadastro e Elegibilidade</h2>
                        <p>
                            Para usar o StreamShare, você precisa:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Ter pelo menos 18 anos ou ser emancipado legalmente.</li>
                            <li>Fornecer informações verdadeiras e atualizadas (Nome, Email, Telefone/WhatsApp).</li>
                            <li>Ser humano (contas criadas por "robôs" não são permitidas).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Regras para Organizadores (Administradores de Grupo)</h2>
                        <p>
                            Se você cria um grupo no StreamShare, você é o "Organizador". Suas responsabilidades são:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Titularidade:</strong> Você deve ser o titular legítimo da assinatura do serviço de streaming que está compartilhando.</li>
                            <li><strong>Compliance:</strong> Você deve garantir que o compartilhamento obedece aos Termos de Uso do serviço original (ex: muitas plataformas permitem compartilhamento apenas com pessoas da mesma residência/família). O StreamShare não fiscaliza isso, a responsabilidade é inteiramente sua.</li>
                            <li><strong>Pagamento Original:</strong> O pagamento da fatura do serviço (Netflix, etc.) é responsabilidade 100% sua. Mesmo que um participante não lhe pague no StreamShare, você deve honrar seu compromisso com o serviço de streaming.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Regras para Participantes (Membros)</h2>
                        <p>
                            Se você entra em um grupo no StreamShare, você é um "Participante".
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Pagamentos:</strong> Você concorda em pagar sua parte da assinatura ("Cota") nas datas estipuladas. Atrasos podem resultar em suspensão do acesso ao grupo.</li>
                            <li><strong>Uso Pessoal:</strong> As credenciais de acesso fornecidas pelo Organizador são para seu uso pessoal. É proibido revender, alugar ou expor publicamente essas senhas.</li>
                            <li><strong>Respeito:</strong> Você deve respeitar os perfis (slots) definidos pelo grupo (ex: não usar o perfil do coleguinha na Netflix).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Pagamentos e Taxas da Plataforma</h2>
                        <p>
                            O StreamShare pode operar de duas formas financeiras:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2 mt-2">
                            <li><strong>Gestão Gratuita/Manual:</strong> O Organizador usa a plataforma apenas para organizar, recebendo os valores por fora (Pix direto, dinheiro). O StreamShare não cobra nada e não se envolve.</li>
                            <li><strong>Gestão Automatizada (Futuro):</strong> O StreamShare processa o pagamento via gateway (ex: Stripe/Pix). Neste caso, poderemos cobrar uma <strong>Taxa de Administração</strong> sobre cada transação para cobrir custos bancários e manutenção do sistema. Essa taxa será exibida claramente antes da confirmação.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Proibições (O que NÃO fazer)</h2>
                        <p>É estritamente proibido:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Usar a plataforma para aplicar golpes ou fraudes financeiras.</li>
                            <li>Compartilhar conteúdo ilegal, pirata, ou que viole direitos autorais.</li>
                            <li>Tentar invadir, copiar ou sobrecarregar nossos servidores.</li>
                            <li>Revender acesso ao próprio StreamShare.</li>
                        </ul>
                        <p className="mt-2 text-red-600 text-sm font-medium">
                            A violação destas regras resultará no banimento imediato e permanente da sua conta, sem aviso prévio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Limitação de Responsabilidade</h2>
                        <p className="font-semibold">LEIA COM ATENÇÃO:</p>
                        <p className="mt-2">
                            O StreamShare <strong>NÃO</strong> se responsabiliza por:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Bloqueios de Conta:</strong> Se a Netflix/Spotify/etc. bloquear sua conta por compartilhamento indevido, a responsabilidade é do Organizador. Nós fornecemos a ferramenta de gestão, o risco do compartilhamento é do usuário.</li>
                            <li><strong>Inadimplência:</strong> Não garantimos que os participantes pagarão. Oferecemos ferramentas de cobrança, mas não somos seguradora de crédito.</li>
                            <li><strong>Instabilidade de Terceiros:</strong> Se o serviço de streaming sair do ar, não é culpa do StreamShare.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Disputas e Cancelamentos</h2>
                        <p>
                            Disputas entre Organizador e Participante (ex: "paguei e não recebi a senha") devem ser resolvidas primordialmente entre as partes. O StreamShare poderá atuar como mediador em casos extremos, reservando-se o direito de decidir pelo reembolso ou bloqueio com base nos registros da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Alterações nestes Termos</h2>
                        <p>
                            Podemos atualizar este documento. Avisaremos sobre mudanças importantes por e-mail ou aviso na plataforma. Continuar usando o StreamShare após as mudanças significa que você aceitou as novidades.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contato e Suporte</h2>
                        <p>
                            Dúvidas jurídicas ou sobre os termos? Entre em contato conosco:
                        </p>
                        <p className="mt-2 text-blue-600 font-medium">
                            suporte@streamshare.com.br
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
