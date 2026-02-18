"use client";

import { ScrollText } from "lucide-react";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalSection } from "@/components/legal/LegalSection";
import { CURRENT_TERMS_VERSION, LAST_TERMS_UPDATED_DATE } from "@/config/legal";

export default function TermosDeUsoPage() {
    const lastUpdate = LAST_TERMS_UPDATED_DATE;
    const version = CURRENT_TERMS_VERSION;

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24 font-sans selection:bg-primary/10">
            <LegalHeader
                title="Termos e Condições Gerais de Uso"
                subtitle={`Publicado em ${lastUpdate} • Versão ${version} • Instrumento Particular de Contrato de Adesão`}
                badgeText="Contrato de Adesão"
                badgeIcon={ScrollText}
                otherLinkText="Política de Privacidade"
                otherLinkHref="/politica-de-privacidade"
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
                            O presente instrumento jurídico estabelece os <strong>Termos e Condições Gerais de Uso</strong> da plataforma StreamShare, doravante denominada simplesmente &quot;Plataforma&quot;, que regulam, de forma vinculante e irretratável, a relação jurídica entre a Plataforma e as pessoas físicas ou jurídicas que dela se utilizam, doravante denominadas &quot;Usuários&quot;.
                        </p>
                        <p>
                            A Plataforma opera exclusivamente como <strong>intermediária de pagamentos e gestora organizacional de grupos de rateio de despesas</strong>, sendo certo que não comercializa, distribui, revende, licencia ou sublicencia, sob qualquer forma ou pretexto, acesso a conteúdos audiovisuais, serviços de telecomunicação ou quaisquer produtos de propriedade de terceiros. A relação jurídica entre as partes é regida pelo instituto do <strong>mandato</strong>, nos termos dos arts. 653 a 692 da Lei nº 10.406/2002 (Código Civil Brasileiro).
                        </p>
                        <p>
                            O compartilhamento de assinaturas gerenciado pela Plataforma destina-se <strong>exclusivamente a núcleos familiares e residenciais</strong>. Ao utilizar a Plataforma, cada Usuário atesta e assume integral responsabilidade pela conformidade domiciliar dos integrantes de seu grupo, nos termos pormenorizados na Cláusula 4ª deste instrumento.
                        </p>
                        <p className="text-sm text-gray-400 italic">
                            A leitura integral e compreensão deste documento constitui condição precedente e indispensável à utilização de quaisquer funcionalidades da Plataforma. A continuidade do acesso ou uso implica anuência tácita, plena e irrestrita às disposições aqui consignadas.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 1ª — NATUREZA JURÍDICA ── */}
                    <LegalSection
                        id="natureza"
                        index="01"
                        title="Da Natureza Jurídica do Serviço"
                        isHighlighted
                    >
                        <p>
                            <strong>Art. 1º.</strong> O StreamShare exerce, em caráter exclusivo, a função de gestora de pagamentos e intermediária organizacional, operando sob o regime jurídico do contrato de mandato, conforme disciplinado pelos arts. 653 a 692 da Lei nº 10.406/2002 (Código Civil Brasileiro). A Plataforma <strong>não é, não se qualifica e não poderá ser caracterizada como fornecedora, revendedora, distribuidora ou operadora de serviços de telecomunicação, de streaming ou de conteúdo audiovisual</strong>, tampouco detém, licencia, sublicencia ou disponibiliza, direta ou indiretamente, conteúdos protegidos por direito autoral de titularidade de terceiros.
                        </p>
                        <p>
                            <strong>§ 1º.</strong> A relação contratual entre o Usuário e a Plataforma configura-se, para todos os efeitos de direito, como <strong>contrato de mandato oneroso</strong>, pelo qual a Plataforma assume a condição de mandatária para organizar e intermediar o rateio de despesas entre os membros integrantes de um grupo de compartilhamento. Resta inequivocamente estabelecido que inexiste, sob qualquer perspectiva jurídica, relação de fornecimento de conteúdo, prestação de serviço de telecomunicação ou disponibilização de acesso a plataformas de streaming.
                        </p>
                        <p>
                            <strong>§ 2º.</strong> Os valores cobrados pela Plataforma a título de remuneração referem-se, exclusiva e taxativamente, à <strong>taxa de intermediação e gestão organizacional</strong>, destinada a remunerar os serviços de coordenação operacional, processamento de pagamentos e manutenção da infraestrutura tecnológica. A referida taxa não constitui, sob nenhuma circunstância ou interpretação, contraprestação por acesso a conteúdo audiovisual, serviço de telecomunicação ou qualquer produto ou serviço de propriedade de terceiros.
                        </p>
                        <p>
                            <strong>§ 3º.</strong> O StreamShare declara, de forma expressa e categórica, que não mantém relação societária, contratual, de agência, representação, franquia, distribuição ou qualquer outro vínculo jurídico com os provedores de conteúdo de streaming, tais como — mas não se limitando a — Netflix, Spotify, Disney+, Amazon Prime Video, HBO Max e similares. Os logotipos, denominações e marcas de terceiros eventualmente exibidos na Plataforma são utilizados para fins exclusivamente referenciais e informativos, em observância ao princípio da nominatividade marcária.
                        </p>
                        <p>
                            <strong>§ 4º.</strong> Em razão da natureza estritamente intermediária e financeira de suas atividades, o StreamShare não se enquadra na definição de Serviço de Valor Adicionado (SVA), nem se qualifica como prestadora de Serviço de Comunicação Multimídia (SCM), nos termos do art. 61 da Lei Geral de Telecomunicações (Lei nº 9.472/1997), estando, por conseguinte, dispensada de autorização, concessão ou permissão da Agência Nacional de Telecomunicações (ANATEL).
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 2ª — DEFINIÇÕES ── */}
                    <LegalSection
                        id="definicoes"
                        index="02"
                        title="Das Definições"
                    >
                        <p>
                            <strong>Art. 1º.</strong> Para os fins do presente instrumento, as expressões e termos técnicos abaixo discriminados possuem as seguintes acepções, independentemente de estarem grafados no singular ou no plural, no masculino ou no feminino:
                        </p>
                        <p>
                            <strong>I — Plataforma.</strong> Designa o sistema tecnológico StreamShare, abrangendo todas as suas funcionalidades, interfaces, módulos e respectivas infraestruturas de suporte, disponibilizados por meio de aplicação web e aplicativos móveis.
                        </p>
                        <p>
                            <strong>II — Usuário.</strong> Toda e qualquer pessoa física ou jurídica, maior e capaz nos termos da legislação civil vigente, que acesse, utilize ou se cadastre na Plataforma, independentemente da modalidade de uso, abrangendo tanto Organizadores quanto Participantes.
                        </p>
                        <p>
                            <strong>III — Organizador.</strong> Usuário titular da assinatura originária do serviço de streaming junto ao respectivo provedor, responsável pela criação e administração do grupo de compartilhamento na Plataforma, bem como pela veracidade das declarações de composição domiciliar.
                        </p>
                        <p>
                            <strong>IV — Participante.</strong> Usuário que adere a um grupo de compartilhamento previamente constituído por um Organizador, assumindo a obrigação de adimplir pontualmente a parcela que lhe cabe no rateio das despesas.
                        </p>
                        <p>
                            <strong>V — Kota (Cota).</strong> Unidade técnica de acesso correspondente a um perfil individual dentro de um grupo de compartilhamento, cuja gestão é intermediada pela Plataforma.
                        </p>
                        <p>
                            <strong>VI — Streaming de Catálogo.</strong> Serviços de provimento de conteúdo audiovisual ou musical operados por terceiros sem qualquer vínculo jurídico, societário ou contratual com o StreamShare.
                        </p>
                        <p>
                            <strong>VII — Membro Extra.</strong> Funcionalidade oficial oferecida por determinadas plataformas de streaming para a inclusão de beneficiários externos ao domicílio principal do assinante titular.
                        </p>
                        <p>
                            <strong>VIII — Gateway de Pagamento.</strong> Entidade financeira ou instituição de pagamento devidamente regulada pelo Banco Central do Brasil, responsável pelo processamento eletrônico e pela liquidação das transações pecuniárias realizadas entre os Usuários por intermédio da Plataforma.
                        </p>
                        <p>
                            <strong>IX — Núcleo Domiciliar.</strong> Conjunto de pessoas físicas que compartilham, de forma efetiva e habitual, o mesmo domicílio residencial, conforme conceituação do art. 70 da Lei nº 10.406/2002 (Código Civil), cuja composição é declarada e atestada pelo Organizador sob sua exclusiva responsabilidade.
                        </p>
                        <p>
                            <strong>X — Taxa de Intermediação.</strong> Valor pecuniário cobrado pela Plataforma a título de remuneração pelos serviços de gestão organizacional, intermediação de pagamentos, coordenação operacional e manutenção da infraestrutura tecnológica, não constituindo, em hipótese alguma, contraprestação por acesso a conteúdo de terceiros.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 3ª — ACEITAÇÃO E VIGÊNCIA ── */}
                    <LegalSection
                        id="aceitacao"
                        index="03"
                        title="Da Aceitação e Vigência"
                    >
                        <p>
                            <strong>Art. 1º.</strong> A utilização, o cadastro ou o acesso a quaisquer funcionalidades da Plataforma StreamShare formaliza, de maneira automática e vinculante, a celebração de um contrato de adesão entre o Usuário e a Plataforma, nos termos dos arts. 423 e 424 da Lei nº 10.406/2002 (Código Civil) e do art. 54 da Lei nº 8.078/1990 (Código de Defesa do Consumidor).
                        </p>
                        <p>
                            <strong>Art. 2º.</strong> A manifestação de concordância eletrônica — expressa mediante clique em botão de aceite, preenchimento de formulário de cadastro ou simples continuidade de navegação após exibição destes Termos — possui plena validade e eficácia jurídica para todos os efeitos legais, equiparando-se, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001, a documento assinado de próprio punho.
                        </p>
                        <p>
                            <strong>Art. 3º.</strong> O presente instrumento vigorará por prazo indeterminado a contar da data de aceite pelo Usuário, podendo ser rescindido por qualquer das partes a qualquer tempo, mediante comunicação prévia, observadas as obrigações financeiras porventura pendentes.
                        </p>
                        <p>
                            <strong>Art. 4º.</strong> A Plataforma reserva-se o direito de modificar, a qualquer tempo e a seu exclusivo critério, as disposições constantes deste instrumento, comprometendo-se a notificar os Usuários com antecedência mínima de trinta dias sobre alterações substanciais. O silêncio do Usuário ou a continuidade do uso após o decurso do prazo de notificação serão interpretados como anuência tácita e irretratável às modificações operadas.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 4ª — USO DOMÉSTICO E RESIDENCIAL ── */}
                    <LegalSection
                        id="uso-domestico"
                        index="04"
                        title="Do Uso Doméstico e Residencial"
                        isHighlighted
                    >
                        <p>
                            <strong>Art. 1º.</strong> Os serviços de gestão e intermediação oferecidos pela Plataforma StreamShare destinam-se <strong>exclusiva e restritamente ao uso doméstico e residencial</strong>, no âmbito de núcleos familiares que compartilham, de forma efetiva e habitual, o mesmo domicílio. O Usuário declara e garante, sob as penas da lei civil e criminal, que todos os integrantes de seu grupo de compartilhamento pertencem ao seu Núcleo Domiciliar, conforme definido na Cláusula 2ª, inciso IX, deste instrumento.
                        </p>
                        <p>
                            <strong>§ 1º — Da Autodeclaração de Domicílio.</strong> Ao criar ou aderir a um grupo de compartilhamento, o Usuário atesta e declara, sob sua exclusiva e intransferível responsabilidade civil e criminal, que os demais integrantes do grupo fazem parte de seu núcleo familiar e residem no mesmo domicílio. A Plataforma não dispõe de meios técnicos, nem possui obrigação legal, regulatória ou contratual, de verificar a veracidade desta declaração, atuando de boa-fé com base nas informações prestadas pelo declarante.
                        </p>
                        <p>
                            <strong>§ 2º — Da Definição de Domicílio.</strong> Para os efeitos deste instrumento, a conceituação de &quot;mesmo domicílio&quot; ou &quot;residência compartilhada&quot; observa a definição civil prevista no art. 70 da Lei nº 10.406/2002 (Código Civil), que estabelece como domicílio da pessoa natural o lugar onde ela fixa sua residência com ânimo definitivo. Cabe exclusivamente ao Usuário a responsabilidade de interpretar, verificar e assegurar que a composição de seu grupo atende, cumulativamente, aos critérios de domicílio estabelecidos pela legislação civil brasileira e pelas políticas internas de cada provedor de streaming.
                        </p>
                        <p>
                            <strong>§ 3º — Da Isenção de Responsabilidade por Declarações Inverídicas.</strong> O StreamShare exime-se, de forma integral e irrestrita, de qualquer responsabilidade por declarações inverídicas, inexatas, incompletas ou dolosas prestadas pelo Usuário quanto à composição de seu Núcleo Domiciliar. As consequências de qualquer natureza decorrentes de tais declarações — incluindo, sem limitação: bloqueio ou suspensão de contas pelos provedores de streaming, rescisão contratual compulsória, penalidades pecuniárias, responsabilização civil por perdas e danos, e responsabilização criminal por falsidade ideológica (art. 299 do Código Penal) — são de inteira, exclusiva e intransferível responsabilidade do Usuário declarante.
                        </p>
                        <p>
                            <strong>§ 4º — Da Conformidade com Políticas dos Provedores.</strong> O Usuário reconhece e aceita que os provedores de serviços de streaming possuem, ou poderão vir a possuir, definições próprias, específicas e variáveis de &quot;domicílio&quot;, &quot;residência&quot; e &quot;compartilhamento familiar&quot;, comprometendo-se a consultar, conhecer e respeitar integralmente as políticas vigentes de cada provedor antes de configurar, alterar ou ampliar seu grupo de compartilhamento na Plataforma.
                        </p>
                        <p>
                            <strong>Art. 2º.</strong> Ao prosseguir com a utilização da Plataforma, o Usuário confirma que leu, compreendeu integralmente e aceita, de forma livre, informada e inequívoca, todas as disposições desta cláusula, assumindo responsabilidade total e irrestrita pela veracidade de suas declarações referentes à composição do Núcleo Domiciliar e à observância das políticas vigentes dos provedores de streaming.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 5ª — OBRIGAÇÕES DO ORGANIZADOR ── */}
                    <LegalSection
                        id="organizadores"
                        index="05"
                        title="Das Obrigações do Organizador"
                    >
                        <p>
                            <strong>Art. 1º.</strong> Sem prejuízo das demais obrigações previstas neste instrumento e na legislação vigente, constituem deveres específicos e inderrogáveis do Organizador:
                        </p>
                        <p>
                            <strong>I — Titularidade e legitimidade.</strong> O Organizador declara e garante ser o titular legítimo e único responsável financeiro perante o provedor de streaming pela assinatura originária que constitui o objeto do grupo de compartilhamento, obrigando-se a comprová-la quando solicitado pela Plataforma.
                        </p>
                        <p>
                            <strong>II — Conformidade contratual com o provedor.</strong> Constitui dever inescusável do Organizador assegurar que o compartilhamento de credenciais de acesso respeite, em sua integralidade, os termos de uso, políticas de privacidade e diretrizes operacionais do provedor de conteúdo originário, responsabilizando-se por eventuais infrações.
                        </p>
                        <p>
                            <strong>III — Veracidade da composição domiciliar.</strong> O Organizador constitui-se como responsável primário pela veracidade e acurácia da declaração de que todos os Participantes de seu grupo integram o mesmo Núcleo Domiciliar, na acepção definida pela Cláusula 2ª, inciso IX, respondendo civilmente por eventuais declarações inverídicas ou pela omissão de informações relevantes.
                        </p>
                        <p>
                            <strong>IV — Manutenção e atualização de credenciais.</strong> O Organizador obriga-se a manter todas as credenciais de acesso e informações cadastrais devidamente atualizadas e fidedignas junto à Plataforma, sob pena de suspensão preventiva da conta até a regularização integral dos dados.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 6ª — OBRIGAÇÕES DO PARTICIPANTE ── */}
                    <LegalSection
                        id="participantes"
                        index="06"
                        title="Das Obrigações do Participante"
                    >
                        <p>
                            <strong>Art. 1º.</strong> Sem prejuízo das demais obrigações previstas neste instrumento e na legislação vigente, constituem deveres específicos e inderrogáveis do Participante:
                        </p>
                        <p>
                            <strong>I — Adimplemento tempestivo.</strong> O Participante compromete-se, de forma irrevogável, com a liquidação pontual e integral de todas as faturas geradas pela Plataforma em razão de sua participação no grupo de compartilhamento, ciente de que o inadimplemento, mesmo que parcial, acarretará a suspensão imediata e automática do acesso às credenciais.
                        </p>
                        <p>
                            <strong>II — Declaração de domicílio compartilhado.</strong> O Participante declara, sob as penas da lei, que integra efetivamente o Núcleo Domiciliar do Organizador e que reside, de forma habitual e permanente, no mesmo endereço residencial, nos termos definidos pela Cláusula 4ª deste instrumento e pelo art. 70 da Lei nº 10.406/2002.
                        </p>
                        <p>
                            <strong>III — Intransferibilidade e pessoalidade.</strong> As credenciais de acesso disponibilizadas ao Participante revestem-se de caráter estritamente pessoal e intransferível, sendo expressamente vedada a sua cessão, sublocação, compartilhamento ou disponibilização a terceiros, sob pena de rescisão imediata e aplicação das penalidades previstas neste instrumento.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 7ª — CÓDIGO DE CONDUTA ── */}
                    <LegalSection
                        id="conduta"
                        index="07"
                        title="Do Código de Conduta"
                    >
                        <p>
                            <strong>Art. 1º.</strong> A utilização da Plataforma subordina-se à observância dos seguintes princípios e diretrizes de conduta, cuja violação poderá ensejar a rescisão contratual imediata e a aplicação das medidas cabíveis:
                        </p>
                        <p>
                            <strong>I — Probidade e uso ético.</strong> O Usuário compromete-se a utilizar a Plataforma em conformidade com a legislação vigente, a moral, os bons costumes e a ordem pública, respeitando os direitos dos demais membros do grupo e observando rigorosamente as políticas estabelecidas pelos provedores de serviços de streaming.
                        </p>
                        <p>
                            <strong>II — Vedação de práticas abusivas e exploração comercial.</strong> É expressamente vedado ao Usuário utilizar a Plataforma para fins de revenda comercial, sublicenciamento, exploração econômica das credenciais compartilhadas, ou qualquer outra atividade que desvirtue a finalidade doméstica e residencial do serviço, conforme delimitada na Cláusula 4ª deste instrumento.
                        </p>
                        <p>
                            <strong>III — Boa-fé objetiva e função social do contrato.</strong> As relações entre Organizadores e Participantes deverão, em todo momento, pautar-se pelos princípios da boa-fé objetiva e da função social do contrato, nos termos dos arts. 421 e 422 da Lei nº 10.406/2002 (Código Civil), impondo-se a todas as partes o dever de cooperação, lealdade e transparência recíprocas.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 8ª — REGIME FINANCEIRO ── */}
                    <LegalSection
                        id="financeiro"
                        index="08"
                        title="Do Regime Financeiro e da Inadimplência"
                    >
                        <p>
                            <strong>Art. 1º.</strong> A infraestrutura tecnológica da Plataforma opera mediante sistema de monitoramento automatizado de fluxo financeiro, que acompanha, em tempo real, o status de adimplemento de cada Usuário. As faturas não liquidadas no prazo de até <strong>vinte e quatro horas</strong> contadas do respectivo vencimento acarretarão, de forma automática e independente de qualquer notificação prévia, a alteração do status do Usuário para &quot;inadimplente&quot;, autorizando a Plataforma a proceder ao bloqueio técnico e imediato das credenciais de acesso até a integral purgação da mora.
                        </p>
                        <p>
                            <strong>Art. 2º.</strong> Os valores arrecadados pela Plataforma junto aos Participantes são repassados ao Organizador titular da assinatura originária, deduzida a Taxa de Intermediação devida ao StreamShare, nos termos da Cláusula 1ª, § 2º, deste instrumento. A Plataforma atua, nesta operação, exclusivamente na condição de mandatária para fins de arrecadação, cobrança e gestão dos valores, não assumindo qualquer responsabilidade pela relação contratual existente entre o Organizador e o provedor originário de streaming.
                        </p>
                        <p>
                            <strong>Art. 3º.</strong> O processamento dos pagamentos é realizado por Gateway de Pagamento devidamente regulado pelo Banco Central do Brasil, operando sob rigorosas normas de segurança financeira. A Plataforma não armazena, em sua infraestrutura própria, dados financeiros sensíveis dos Usuários, tais como numeração integral de cartões de crédito ou códigos de verificação.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 9ª — LIMITAÇÃO DE RESPONSABILIDADE ── */}
                    <LegalSection
                        id="responsabilidade"
                        index="09"
                        title="Da Limitação de Responsabilidade"
                    >
                        <p>
                            <strong>Art. 1º.</strong> O StreamShare, na qualidade de intermediária de pagamentos e gestora organizacional operando sob regime de mandato, <strong>não assume e não poderá ser responsabilizada</strong>, solidária ou subsidiariamente, por quaisquer interrupções, bloqueios, suspensões, restrições ou cancelamentos de contas impostos pelos provedores originais de streaming, sejam estes decorrentes de políticas de compartilhamento de credenciais, verificação de domicílio, geolocalização, ou quaisquer outras medidas técnicas, contratuais ou regulatórias implementadas unilateralmente por referidos terceiros.
                        </p>
                        <p>
                            <strong>§ 1º — Quanto ao conteúdo de terceiros.</strong> A Plataforma não oferece qualquer garantia, expressa ou implícita, acerca da disponibilidade, qualidade, continuidade, integridade ou adequação do conteúdo disponibilizado pelos provedores de streaming, cuja responsabilidade compete integral e exclusivamente aos respectivos titulares do serviço.
                        </p>
                        <p>
                            <strong>§ 2º — Quanto às declarações prestadas pelo Usuário.</strong> A Plataforma exime-se de responsabilidade pela veracidade, exatidão e completude das declarações de composição domiciliar e demais informações prestadas pelo Usuário nos termos da Cláusula 4ª deste instrumento, cabendo a este toda e qualquer consequência jurídica, administrativa ou pecuniária decorrente de declaração inverídica, incompleta ou dolosa.
                        </p>
                        <p>
                            <strong>§ 3º — Do regime de mandato e seus limites.</strong> A responsabilidade da Plataforma circunscreve-se, estritamente, à correta execução do mandato de gestão conforme descrito na Cláusula 1ª deste instrumento, não se estendendo, em hipótese alguma, a atos, fatos, omissões, inadimplementos ou condutas praticadas pelos provedores de conteúdo, pelos Gateways de Pagamento ou pelos próprios Usuários no exercício de suas prerrogativas contratuais.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 10ª — POLÍTICAS DE TERCEIROS ── */}
                    <LegalSection
                        id="terceiros"
                        index="10"
                        title="Das Políticas de Terceiros e Alterações Unilaterais"
                    >
                        <p>
                            <strong>Art. 1º.</strong> O Usuário declara ter ciência e aceitar que os provedores de conteúdo de streaming reservam-se, nos termos de seus respectivos contratos de adesão, o direito soberano de implementar, modificar, ampliar ou restringir, a qualquer tempo e de forma unilateral, mecanismos técnicos de controle de acesso, tais como — exemplificativamente — verificação de endereço IP, validação de domicílio por geolocalização, autenticação multifator e políticas de compartilhamento de senhas.
                        </p>
                        <p>
                            <strong>Art. 2º.</strong> O StreamShare, na condição de intermediária de pagamentos, <strong>não garante a perenidade ou a continuidade</strong> da fruição dos serviços de streaming por parte dos Participantes na hipótese de superveniência de alterações estruturais nas políticas de acesso dos provedores de conteúdo originários, exonerando-se de qualquer obrigação de indenizar ou compensar os Usuários por eventuais prejuízos decorrentes de tais alterações.
                        </p>
                        <p>
                            <strong>Art. 3º.</strong> Na eventualidade de alteração substancial e permanente das políticas de compartilhamento por parte dos provedores de streaming que venha a inviabilizar, de forma objetiva e comprovada, o modelo de rateio de despesas operado pela Plataforma, o StreamShare comunicará os Usuários afetados no prazo de quinze dias e oferecerá, sem ônus adicionais, a opção de cancelamento integral do grupo e restituição proporcional de valores eventualmente pagos e não usufruídos.
                        </p>
                    </LegalSection>

                    {/* ── CLÁUSULA 11ª — DISPOSIÇÕES FINAIS ── */}
                    <LegalSection
                        id="disposicoes"
                        index="11"
                        title="Das Disposições Finais e Transitórias"
                    >
                        <p>
                            <strong>Art. 1º.</strong> As partes elegem o foro da Comarca do domicílio do Usuário como competente para dirimir quaisquer controvérsias oriundas do presente instrumento, podendo a Plataforma, alternativamente, optar pelo foro de sua sede, em conformidade com o art. 101, I, da Lei nº 8.078/1990 (Código de Defesa do Consumidor).
                        </p>
                        <p>
                            <strong>Art. 2º.</strong> A eventual nulidade, invalidade ou ineficácia de qualquer cláusula ou disposição deste instrumento não comprometerá a validade e eficácia das demais, que permanecerão em pleno vigor, aplicando-se o princípio da conservação dos negócios jurídicos previsto no art. 184 da Lei nº 10.406/2002 (Código Civil).
                        </p>
                        <p>
                            <strong>Art. 3º.</strong> A tolerância ou omissão de qualquer das partes em exigir o estrito cumprimento das obrigações aqui pactuadas não constituirá renúncia, novação ou precedente invocável, nem afetará o direito de exigir o cumprimento a qualquer tempo.
                        </p>
                        <p>
                            <strong>Art. 4º.</strong> O presente instrumento é regido pelas leis da República Federativa do Brasil, aplicando-se, subsidiariamente e naquilo que não conflitar com as disposições específicas deste contrato, as normas do Código Civil (Lei nº 10.406/2002), do Código de Defesa do Consumidor (Lei nº 8.078/1990), do Marco Civil da Internet (Lei nº 12.965/2014) e da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
                        </p>
                    </LegalSection>

                    {/* ── CONTATO ── */}
                    <LegalSection
                        id="contato"
                        title="Canal de Atendimento e Notificações Jurídicas"
                    >
                        <p>
                            Para esclarecimentos referentes ao presente instrumento, exercício de direitos contratuais, envio de notificações extrajudiciais ou quaisquer comunicações de natureza jurídica, o Usuário deverá dirigir-se exclusivamente ao canal oficial abaixo indicado, sendo este o único meio reconhecido pela Plataforma para fins de comunicação formal:
                        </p>
                        <div className="mt-6">
                            <a
                                href="mailto:atendimento@streamshare.com.br"
                                className="inline-block px-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black hover:bg-primary transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-sm md:text-base"
                            >
                                atendimento@streamshare.com.br
                            </a>
                        </div>
                    </LegalSection>

                    {/* ── RODAPÉ DO DOCUMENTO ── */}
                    <div className="mt-24 pt-10 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em]">
                            StreamShare — Termos e Condições Gerais de Uso © 2026
                        </p>
                        <p className="text-[10px] text-gray-300 mt-1 tracking-[0.2em]">
                            Documento publicado em {lastUpdate} • Revisão {version}
                        </p>
                    </div>
                </article>
            </div>
        </div>
    );
}
