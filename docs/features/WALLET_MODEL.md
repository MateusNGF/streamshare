# Feature: Modelo Wallet e Pagamentos Centralizados

## Motivação e Abordagem
A StreamShare adotou o modelo de **Carteira Virtual (Wallet)** para centralizar todos os recebimentos na conta do MercadoPago da própria plataforma. 
Isso remove a necessidade de cada responsável de grupo ter que conectar sua própria conta do MercadoPago via OAuth.

## Fluxo de Entrada de Caixa
Quando um Participante paga sua fatura via PIX:
1. O Webhook do MercadoPago sinaliza que a fatura foi paga.
2. O sistema executa uma Transação Atômica (`prisma.$transaction`) que:
   - Marca a Cobrança como Paga.
   - Ativa/renova a Assinatura (se for o caso).
   - Localiza a `Wallet` associada à `Conta` administradora do grupo.
   - Adiciona o Valor Líquido (Pago Memos a Taxa) no `saldoDisponivel` da Wallet.
   - Registra no Ledger `WalletTransaction` a entrada (`CREDITO_COTA`) e a retenção da plataforma (`DEBITO_TAXA`).

## Fluxo de Saque
1. **Solicitação**: O admin do grupo visualiza o saldo no Dashboard (`/faturamento`) e solicita um saque. Ele deve ter previamente configurado sua **Chave PIX e Tipo da Chave** em "Configurações > Minha Conta".
2. **Bloqueio Atomicamente**: A server action `solicitarSaque` faz um `decrement` no `saldoDisponivel` do banco dentro de uma transaction e gera um `Saque` no status `PENDENTE`.
3. **Aprovação**: Na Área de Administração Global (`/admin/saques`), o super admin copia a chave PIX, faz a transferência pelo banco físico (ou MP manual), clica em Aprovar e insere o comprovante.
4. **Rejeição**: Se houver algo errado, o super admin Rejeita, definindo um motivo. Isso estorna o saldo imediatamente para a `Wallet` via `increment`.

## Tabela Limpa (Ledger)
A Model `WalletTransaction` armazena o histórico imutável:
- `CREDITO_COTA`: Entrada referente a cota recebida de um participante.
- `DEBITO_TAXA`: Taxa da StreamShare retida na fonte.
- `SAQUE`: Abatimentos efetuados através dos pedidos de saque.
- `ESTORNO`: Estornos de pedidos de saque rejeitados.
- `CHARGEBACK`: Caso um pagamento de cartão seja contestado.

## Segurança
- Todas as validações financeiras e incrementos consultam os dados puramente no Back-end no ato da query, impossibilitando adulteração no Front-end (ex: forjar valor de saque).
- Uso obrigatório de `$transaction` garantindo que não haverá atualização de fatura sem o reflexo na Wallet e vice-versa.
- Verificação de Idempotência no Webhook: O MercadoPago as vezes dispara o mesmo POST mais de uma vez. O código checa se o `referenciaGateway` (payment id) já não foi processado no Ledger antes de fazer novos inserimentos.
