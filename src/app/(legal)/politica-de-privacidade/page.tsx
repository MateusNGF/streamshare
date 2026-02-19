"use client";

import { Shield, Mail } from "lucide-react";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalSection } from "@/components/legal/LegalSection";
import { CURRENT_PRIVACY_VERSION, LAST_PRIVACY_UPDATED_DATE } from "@/config/legal";

export default function PoliticaDePrivacidadePage() {
    const lastUpdate = LAST_PRIVACY_UPDATED_DATE;
    const version = CURRENT_PRIVACY_VERSION;

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24 font-sans selection:bg-primary/10">
            <LegalHeader
                title="Política de Privacidade e Proteção de Dados Pessoais"
                subtitle={`Instrumento vigente a partir de ${lastUpdate} • Revisão ${version} — Em conformidade com a LGPD`}
                badgeText="Documento Oficial"
                badgeIcon={Shield}
                otherLinkText="Termos de Uso"
                otherLinkHref="/termos-de-uso"
            />

            <div className="container mx-auto px-6 max-w-5xl">
                <article className="space-y-16">

                    {/* ── PREÂMBULO ── */}
                    <LegalSection
                        id="preambulo"
                        title="Preâmbulo"
                        isHighlighted
                    >
                        <p>
                            O StreamShare, na qualidade de <strong>controlador de dados pessoais</strong> nos termos do art. 5º, VI, da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD), estabelece, por meio do presente instrumento, as diretrizes, princípios e práticas adotadas no que concerne à coleta, ao tratamento, ao armazenamento, ao compartilhamento e à eliminação de dados pessoais dos Usuários e titulares que utilizam a Plataforma.
                        </p>
                        <p>
                            Este instrumento foi elaborado em estrita observância à <strong>LGPD</strong>, ao <strong>Marco Civil da Internet</strong> (Lei nº 12.965/2014), ao <strong>Decreto nº 8.771/2016</strong> e às orientações emanadas da <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>, constituindo parte integrante e indissociável dos Termos e Condições Gerais de Uso da Plataforma.
                        </p>
                        <p className="text-sm text-gray-400 italic">
                            Ao utilizar a Plataforma StreamShare, o titular manifesta consentimento livre, informado, inequívoco e expresso com as práticas de tratamento de dados aqui descritas, nos termos do art. 7º, I, e art. 8º, caput, da LGPD. A leitura integral deste documento constitui condição precedente e indispensável à utilização de quaisquer funcionalidades da Plataforma.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 1ª — COLETA, BASE LEGAL E RETENÇÃO ── */}
                    <LegalSection
                        id="coleta-base-legal"
                        index="01"
                        title="Da Coleta de Dados Pessoais, das Bases Legais e dos Prazos de Retenção"
                    >
                        <p>
                            <strong>Art. 1º.</strong> A coleta de dados pessoais operada pela Plataforma restringe-se ao mínimo estritamente indispensável para a viabilização técnica e jurídica dos serviços de gestão e intermediação de pagamentos, em rigorosa observância ao princípio da <strong>minimização de dados</strong> consagrado no art. 6º, III, da LGPD. Cada categoria de dado coletado possui finalidade determinada, explícita e legítima, conforme exigência do art. 6º, I, do mesmo diploma legal.
                        </p>

                        <p>
                            <strong>Art. 2º.</strong> Os dados pessoais coletados pela Plataforma, suas respectivas finalidades de tratamento, bases legais autorizadoras e prazos de retenção são os seguintes:
                        </p>

                        <p>
                            <strong>I — Nome completo.</strong> Coletado para fins de identificação civil do titular no âmbito da celebração e execução contratual, do cumprimento de obrigações legais e do exercício regular de direitos em sede judicial ou administrativa. Constitui a base legal deste tratamento o art. 7º, V, da LGPD (execução de contrato). Os dados serão retidos durante a vigência da relação contratual, acrescidos do prazo prescricional de cinco anos previsto no art. 206, § 5º, da Lei nº 10.406/2002 (Código Civil).
                        </p>

                        <p>
                            <strong>II — CPF (Cadastro de Pessoa Física).</strong> Coletado para validação inequívoca da identidade civil do titular, prevenção a fraudes, cumprimento de obrigações tributárias perante a Receita Federal do Brasil e observância das normas de compliance financeiro. A base legal aplicável é o art. 7º, II, da LGPD (cumprimento de obrigação legal). O prazo de retenção é de cinco anos contados do encerramento da conta, em conformidade com o art. 173 do Código Tributário Nacional.
                        </p>

                        <p>
                            <strong>III — Endereço de correio eletrônico (e-mail).</strong> Coletado para autenticação de acesso à Plataforma, envio de comunicações transacionais obrigatórias, recuperação de credenciais de acesso e notificações de segurança da conta. A base legal é o art. 7º, V, da LGPD (execução de contrato). A retenção perdurará pela vigência contratual, acrescida de um ano.
                        </p>

                        <p>
                            <strong>IV — Número de telefone.</strong> Coletado, quando facultativamente fornecido pelo titular, para execução de automações de cobrança, envio de alertas de vencimento e notificações de segurança previamente autorizadas e configuradas pelo titular. A base legal é o art. 7º, IX, da LGPD (legítimo interesse do controlador). A eliminação ocorrerá de forma imediata ao término da relação contratual.
                        </p>

                        <p>
                            <strong>V — Registros de acesso (logs).</strong> Coletados para fins de manutenção da segurança e integridade da Plataforma, realização de auditorias internas e cumprimento das obrigações de guarda de registros impostas pela legislação vigente. A base legal é o art. 7º, II, da LGPD (cumprimento de obrigação legal). O prazo de retenção é de seis meses, em conformidade com o art. 15 da Lei nº 12.965/2014 (Marco Civil da Internet).
                        </p>

                        <p>
                            <strong>VI — Histórico financeiro.</strong> Coletado para gestão e controle de adimplemento, emissão de comprovantes de transação, contabilização fiscal e instrução de eventuais procedimentos de resolução de disputas. A base legal é o art. 7º, V, da LGPD (execução de contrato). O prazo de retenção é de <strong>cinco anos</strong>, independentemente da troca de fornecedores de processamento de pagamentos, em fiel cumprimento às obrigações fiscais e tributárias (art. 195, parágrafo único, do Código Tributário Nacional).
                        </p>

                        <p>
                            <strong>VII — Cookies de sessão.</strong> Utilizados para manutenção do estado de autenticação do Usuário, proteção da integridade da sessão e prevenção contra ataques de falsificação de requisição. A base legal é o art. 7º, IX, da LGPD (legítimo interesse do controlador). A expiração ocorre ao encerramento da sessão ativa pelo navegador.
                        </p>

                        <p>
                            <strong>Art. 3º.</strong> A Plataforma declara que <strong>não coleta, não trata e não armazena dados pessoais sensíveis</strong>, assim qualificados pelo art. 5º, II, da LGPD — a saber: dados relativos a origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou organização de caráter religioso, filosófico ou político, saúde, vida sexual, dados genéticos ou biométricos. Na hipótese de tal coleta tornar-se imprescindível para a prestação dos serviços, será obtido consentimento específico, destacado e informado do titular, nos termos do art. 11, I, da LGPD.
                        </p>

                        <p>
                            <strong>Art. 4º.</strong> Decorrido o prazo de retenção aplicável a cada categoria de dados, a Plataforma procederá à eliminação segura e irreversível das informações, em conformidade com o art. 16 da LGPD. Excetuam-se os casos em que a legislação imponha conservação por período adicional ou quando os dados sejam necessários para o exercício regular de direitos em processos judiciais, administrativos ou arbitrais.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 2ª — COOKIES ── */}
                    <LegalSection
                        id="cookies"
                        index="02"
                        title="Do Uso de Cookies e Tecnologias de Rastreamento"
                    >
                        <p>
                            <strong>Art. 1º.</strong> A Plataforma utiliza cookies e tecnologias de armazenamento local de forma restrita, proporcional e transparente. Cookies são pequenos arquivos de texto armazenados no dispositivo do Usuário que permitem à Plataforma reconhecer sessões autenticadas, personalizar a experiência de navegação e coletar dados agregados de utilização. A utilização de cookies pela Plataforma fundamenta-se no art. 7º, IX, da LGPD (legítimo interesse do controlador) e nas diretrizes publicadas pela ANPD.
                        </p>

                        <p>
                            <strong>Art. 2º.</strong> Os cookies utilizados pela Plataforma classificam-se nas seguintes categorias:
                        </p>

                        <p>
                            <strong>I — Cookies essenciais.</strong> São aqueles indispensáveis ao funcionamento técnico da Plataforma. Compreendem os cookies de autenticação de sessão, necessários para manter o Usuário conectado de forma segura, e os tokens de proteção contra falsificação de requisições, gerados individualmente por sessão e invalidados automaticamente ao término da sessão. A desativação destes cookies pelo Usuário acarretará a impossibilidade de acesso às funcionalidades autenticadas da Plataforma.
                        </p>

                        <p>
                            <strong>II — Cookies funcionais.</strong> Destinam-se ao armazenamento das preferências de interface do Usuário, incluindo configurações de tema visual, preferências de notificação e demais personalizações, visando à melhoria contínua da experiência de navegação.
                        </p>

                        <p>
                            <strong>III — Cookies analíticos.</strong> Coletam métricas agregadas, anonimizadas e não identificáveis de utilização da Plataforma, destinadas exclusivamente à melhoria contínua do serviço. Estes cookies não vinculam dados a Usuários individuais e poderão ser recusados pelo titular sem qualquer prejuízo à funcionalidade essencial da Plataforma.
                        </p>

                        <p>
                            <strong>Art. 3º.</strong> Os cookies de sessão são configurados com múltiplas camadas de proteção técnica que impedem o acesso indevido por scripts executados no lado do cliente, a transmissão em conexões não criptografadas e o envio em requisições entre domínios distintos. O conteúdo dos cookies é <strong>criptografado em repouso</strong> mediante padrões criptográficos reconhecidos pela indústria, em conformidade com as diretrizes de segurança publicadas pela ANPD.
                        </p>

                        <p>
                            <strong>Parágrafo único.</strong> O gerenciamento das preferências de cookies poderá ser realizado pelo titular por meio das configurações de sua conta na Plataforma ou mediante os controles nativos disponibilizados pelo navegador de internet utilizado.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 3ª — FINALIDADE ── */}
                    <LegalSection
                        id="finalidade"
                        index="03"
                        title="Da Finalidade Específica do Tratamento de Dados"
                    >
                        <p>
                            <strong>Art. 1º.</strong> Os dados pessoais coletados pela Plataforma são utilizados exclusivamente para as finalidades informadas no momento da coleta, sendo vedado o tratamento para finalidades incompatíveis, em observância ao princípio da adequação previsto no art. 6º, II, da LGPD. As finalidades específicas são as seguintes:
                        </p>

                        <p>
                            <strong>I — Execução do contrato de mandato e gestão organizacional.</strong> Viabilizar a intermediação de pagamentos entre Organizadores e Participantes, a gestão operacional dos grupos de compartilhamento, a emissão de comprovantes de transação e o acompanhamento do status de adimplemento dos Usuários, em cumprimento ao contrato de mandato celebrado entre as partes. Base legal: art. 7º, V, da LGPD.
                        </p>

                        <p>
                            <strong>II — Comunicações transacionais obrigatórias.</strong> Envio de alertas de vencimento de faturas, confirmações de pagamento recebido, notificações de alteração de status contratual e comunicações de segurança da conta, realizados por meio dos canais previamente autorizados e configurados pelo titular. Base legal: art. 7º, IX, da LGPD.
                        </p>

                        <p>
                            <strong>III — Prevenção a fraudes e segurança da informação.</strong> Análise de padrões de acesso, detecção de atividades suspeitas, prevenção contra tentativas de acesso não autorizado e manutenção da integridade e disponibilidade da infraestrutura tecnológica da Plataforma. Base legal: art. 7º, IX, da LGPD.
                        </p>

                        <p>
                            <strong>IV — Cumprimento de obrigações legais e regulatórias.</strong> Atendimento a requisições judiciais, intimações do Ministério Público, determinações da ANPD, obrigações tributárias perante a Receita Federal e cumprimento das exigências de guarda de registros previstas no art. 15 do Marco Civil da Internet (Lei nº 12.965/2014). Base legal: art. 7º, II, da LGPD.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 4ª — SEGURANÇA ── */}
                    <LegalSection
                        id="seguranca"
                        index="04"
                        title="Das Medidas de Segurança e Proteção Técnica de Dados"
                    >
                        <p>
                            <strong>Art. 1º.</strong> Em cumprimento ao art. 46 da LGPD, a Plataforma adota medidas de segurança técnicas e administrativas proporcionais à natureza dos dados tratados e aptas a proteger os dados pessoais de acessos não autorizados, situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.
                        </p>

                        <p>
                            <strong>Art. 2º.</strong> A Plataforma utiliza o <strong>Mercado Pago</strong> como suboperador de dados personificados para o processamento financeiro. O Mercado Pago atua como a entidade responsável por capturar, processar e armazenar de forma segura (PCI-DSS) todos os dados sensíveis de pagamento, como números de cartões e códigos de segurança. Por força desta delegação técnica, a infraestrutura própria do StreamShare permanece isenta de contato com dados financeiros críticos, transferindo a responsabilidade da custódia desses ativos ao gateway especialista, nos termos da LGPD.
                        </p>

                        <p>
                            <strong>Art. 3º.</strong> Todos os dados pessoais armazenados na Plataforma — incluindo credenciais de acesso, tokens de autenticação e informações de sessão — são protegidos por criptografia em repouso mediante algoritmos reconhecidos pela indústria de segurança da informação. As senhas dos Usuários jamais são armazenadas em texto plano; a Plataforma emprega funções de derivação criptográfica em conformidade com os padrões recomendados pelos principais organismos internacionais de padronização de segurança.
                        </p>

                        <p>
                            <strong>Art. 4º.</strong> Toda comunicação entre os dispositivos dos Usuários e os servidores da Plataforma é protegida por protocolos de criptografia de transporte atualizados, garantindo a confidencialidade, a integridade e a autenticidade dos dados em trânsito. Os certificados digitais são renovados automaticamente e submetidos a monitoramento contínuo.
                        </p>

                        <p>
                            <strong>Art. 5º.</strong> Na ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos direitos e liberdades dos titulares, a Plataforma compromete-se a notificar a Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados no prazo máximo de <strong>setenta e duas horas</strong>, em conformidade com o art. 48 da LGPD e as diretrizes regulamentares da ANPD. A comunicação conterá, no mínimo: a descrição da natureza dos dados pessoais afetados; as informações sobre os titulares envolvidos; a indicação das medidas técnicas e de segurança utilizadas para a proteção dos dados; os riscos relacionados ao incidente; e as medidas adotadas para reverter ou mitigar os efeitos do prejuízo.
                        </p>

                        <p>
                            <strong>Art. 6º.</strong> A Plataforma elabora e mantém atualizado o Relatório de Impacto à Proteção de Dados Pessoais (RIPD) para as operações de tratamento que apresentem maior risco aos direitos e liberdades dos titulares, nos termos do art. 38 da LGPD. O referido relatório encontra-se disponível para consulta mediante solicitação formal dirigida à Encarregada de Proteção de Dados.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 5ª — COMPARTILHAMENTO ── */}
                    <LegalSection
                        id="compartilhamento"
                        index="05"
                        title="Do Compartilhamento e da Comunicação de Dados a Terceiros"
                    >
                        <p>
                            <strong>Art. 1º.</strong> O StreamShare declara, de forma expressa e categórica, que <strong>não comercializa, não aluga, não cede e não disponibiliza</strong> dados pessoais de seus Usuários a terceiros para fins publicitários, comerciais, de marketing direto ou quaisquer outras finalidades estranhas àquelas expressamente descritas neste instrumento.
                        </p>

                        <p>
                            <strong>Art. 2º.</strong> O compartilhamento de dados pessoais com terceiros é realizado exclusivamente nas hipóteses taxativamente previstas nesta cláusula, em conformidade com os arts. 26 a 28 da LGPD e observados os princípios da necessidade e da minimização:
                        </p>

                        <p>
                            <strong>I — Membros do mesmo grupo de compartilhamento.</strong> A Plataforma disponibiliza aos demais integrantes de um grupo de compartilhamento, exclusivamente, o nome e o status financeiro (adimplente ou inadimplente) de cada Participante, constituindo o conjunto mínimo de dados necessário à execução do contrato de gestão coletiva e ao exercício do direito de informação do Organizador acerca da composição financeira de seu grupo. Base legal: art. 7º, V, da LGPD.
                        </p>

                        <p>
                            <strong>II — Instituições de pagamento e suboperadores.</strong> A Plataforma transmite aos processadores de pagamento exclusivamente os dados mínimos e estritamente necessários para a liquidação das transações financeiras, por meio de canais criptografados. Os referidos processadores encontram-se vinculados à Plataforma por instrumento contratual que assegura o tratamento dos dados em conformidade com a LGPD. Base legal: art. 7º, V, da LGPD.
                        </p>

                        <p>
                            <strong>III — Autoridades judiciais, regulatórias e policiais.</strong> A Plataforma comunicará dados pessoais a autoridades públicas competentes exclusivamente em cumprimento a ordens judiciais, mandados, intimações, requisições do Ministério Público, determinações da ANPD ou de outras autoridades investidas de competência legal, estritamente nos limites do ordenamento jurídico vigente e mediante verificação prévia da autenticidade e regularidade formal da requisição. Base legal: art. 7º, II, da LGPD.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 6ª — DIREITOS DO TITULAR ── */}
                    <LegalSection
                        id="direitos"
                        index="06"
                        title="Dos Direitos do Titular e dos Procedimentos para seu Exercício"
                        isHighlighted
                    >
                        <p>
                            <strong>Art. 1º.</strong> A LGPD assegura ao titular de dados pessoais um conjunto amplo de direitos, previstos no art. 18 do referido diploma legal. A Plataforma compromete-se a viabilizar o exercício pleno e efetivo de cada um deles, nos termos e prazos adiante especificados. Todas as solicitações serão respondidas em prazo não superior a <strong>quinze dias corridos</strong>, contados a partir da data de recebimento, em conformidade com o art. 19 da LGPD. O atendimento será precedido de procedimento de verificação de identidade para proteção do próprio titular contra acesso indevido a seus dados.
                        </p>

                        <p>
                            <strong>Art. 2º.</strong> O titular poderá exercer, gratuitamente e a qualquer tempo, os seguintes direitos:
                        </p>

                        <p>
                            <strong>I — Direito de confirmação e acesso</strong> (art. 18, I e II, da LGPD). O titular poderá obter confirmação da existência de tratamento de seus dados pessoais e, em caso positivo, acesso integral às informações tratadas, incluindo as finalidades do tratamento, sua forma e duração, a identificação do controlador e os destinatários dos dados. Para exercer este direito, o titular deverá encaminhar solicitação para o endereço eletrônico <em>privacidade@streamshare.com.br</em>, indicando no campo assunto &quot;LGPD — Solicitação de Acesso aos Dados&quot;, acompanhada de cópia de documento de identificação com foto.
                        </p>

                        <p>
                            <strong>II — Direito de retificação</strong> (art. 18, III, da LGPD). O titular poderá solicitar a correção de dados pessoais incompletos, inexatos ou desatualizados. Para correções imediatas, o titular poderá utilizar a funcionalidade &quot;Configurações &gt; Perfil&quot; disponível na Plataforma. Para dados que não possam ser editados diretamente, o titular deverá encaminhar solicitação formal para <em>privacidade@streamshare.com.br</em>.
                        </p>

                        <p>
                            <strong>III — Direito de eliminação</strong> (art. 18, VI, da LGPD). O titular poderá solicitar a exclusão definitiva dos dados pessoais tratados com base em seu consentimento ou no legítimo interesse do controlador. Ressalvam-se as hipóteses legais de conservação obrigatória previstas no art. 16 da LGPD — a exemplo dos registros de acesso, cuja guarda por seis meses é imposta pelo Marco Civil da Internet, e dos registros fiscais, cuja retenção por cinco anos é determinada pelo Código Tributário Nacional. Para exercer este direito, o titular deverá enviar solicitação para <em>privacidade@streamshare.com.br</em> com o assunto &quot;LGPD — Solicitação de Eliminação de Dados&quot;.
                        </p>

                        <p>
                            <strong>IV — Direito de portabilidade</strong> (art. 18, V, da LGPD). O titular poderá requerer o recebimento de seus dados pessoais em formato estruturado, de uso comum e leitura automatizada, para fins de transferência a outro fornecedor de serviço ou produto, nos termos da regulamentação da ANPD. O arquivo será disponibilizado no prazo legal.
                        </p>

                        <p>
                            <strong>V — Direito de informação sobre compartilhamento</strong> (art. 18, VII, da LGPD). O titular poderá obter informações completas sobre as entidades públicas e privadas com as quais o StreamShare realizou uso compartilhado de seus dados pessoais, incluindo a natureza, a finalidade e a base legal de cada operação de compartilhamento.
                        </p>

                        <p>
                            <strong>VI — Direito de oposição</strong> (art. 18, § 2º, da LGPD). O titular poderá opor-se ao tratamento de dados pessoais realizado com fundamento no legítimo interesse do controlador, nas hipóteses em que seus direitos e liberdades fundamentais prevaleçam sobre o interesse legítimo alegado. Para tanto, deverá encaminhar solicitação fundamentada para <em>privacidade@streamshare.com.br</em>, indicando o tratamento específico ao qual se opõe e as razões que amparam a oposição.
                        </p>

                        <p>
                            <strong>Art. 3º.</strong> Em conformidade com o art. 18, § 1º, da LGPD, caso o titular considere que o tratamento de seus dados pessoais viola as disposições da legislação de proteção de dados, é-lhe assegurado o direito de apresentar petição diretamente à Autoridade Nacional de Proteção de Dados, sem prejuízo do recurso a outras vias administrativas, judiciais ou arbitrais previstas no ordenamento jurídico brasileiro.
                        </p>

                        <div className="mt-10 pt-8 border-t border-primary/10">
                            <p className="text-gray-900 font-bold mb-2">
                                Canal oficial para exercício de direitos — Encarregada de Proteção de Dados Pessoais (DPO)
                            </p>
                            <p className="text-sm text-gray-500 mb-5">
                                Todas as solicitações relativas aos direitos do titular deverão ser dirigidas exclusivamente ao endereço eletrônico abaixo, sendo este o único canal reconhecido pela Plataforma para fins de comunicação formal em matéria de proteção de dados pessoais.
                            </p>
                            <a
                                href="mailto:privacidade@streamshare.com.br"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-lg text-sm"
                            >
                                <Mail size={16} />
                                privacidade@streamshare.com.br
                            </a>
                            <p className="text-xs text-gray-400 mt-4">
                                Prazo de resposta: até 15 dias corridos (art. 19, LGPD) • Atendimento em língua portuguesa
                            </p>
                        </div>
                    </LegalSection>

                    {/* ── CLÁUSULA 7ª — ALTERAÇÕES ── */}
                    <LegalSection
                        id="alteracoes"
                        index="07"
                        title="Das Alterações e Revisões desta Política"
                    >
                        <p>
                            <strong>Art. 1º.</strong> A presente Política de Privacidade poderá ser atualizada e revisada periodicamente para refletir alterações nas práticas de tratamento de dados pessoais adotadas pela Plataforma, mudanças na legislação aplicável, orientações ou determinações da ANPD, ou evolução dos serviços oferecidos. As alterações materiais — assim entendidas aquelas que impactem de forma significativa os direitos do titular ou as condições de tratamento — serão comunicadas com antecedência mínima de <strong>trinta dias</strong>, mediante notificação enviada ao endereço de e-mail cadastrado e aviso destacado na interface da Plataforma.
                        </p>
                        <p>
                            <strong>Art. 2º.</strong> A versão vigente desta Política estará permanentemente disponível nesta página, com a data da última atualização e o número de revisão indicados tanto no cabeçalho quanto no rodapé do documento. Recomenda-se ao titular a consulta periódica deste instrumento.
                        </p>
                        <p>
                            <strong>Art. 3º.</strong> A continuidade do uso da Plataforma após a entrada em vigor das alterações comunicadas implica aceitação tácita, plena e irretratável da nova versão desta Política. Caso discorde das alterações, o titular poderá, a qualquer tempo, solicitar o encerramento de sua conta e a eliminação de seus dados pessoais, observados os procedimentos e ressalvas descritos na Cláusula 6ª deste instrumento.
                        </p>
                    </LegalSection>

                    {/* ── RODAPÉ DO DOCUMENTO ── */}
                    <div className="mt-24 pt-10 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em]">
                            StreamShare — Política de Privacidade e Proteção de Dados Pessoais © 2026
                        </p>
                        <p className="text-[10px] text-gray-300 mt-1 tracking-[0.2em]">
                            Documento publicado em {lastUpdate} • Revisão {version} • Em conformidade com a Lei nº 13.709/2018 (LGPD)
                        </p>
                    </div>
                </article>
            </div>
        </div>
    );
}
