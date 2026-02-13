# 📖 Central de Documentação StreamShare

Esta central organiza todo o conhecimento técnico e de negócio do ecossistema StreamShare.

## 🏗️ Core & Arquitetura

Portal técnico para desenvolvedores.

- **[Guia de Setup](./setup/COMO_RODAR.md)**: Comece por aqui para rodar o projeto localmente.
- **[Auditoria & Viabilidade](./AUDITORIA_E_DOCUMENTACAO.md)**: Análise profunda de arquitetura, fluxos e regras de negócio.
- **[Modelo de Dados](./DATABASE.md)**: Schema Prisma, relacionamentos e isolamento multi-tenant.
- **[Changelog Guidelines](./CHANGELOG_GUIDELINES.md)**: Padrões para escrita de atualizações públicas e internas.

## 🎨 Design System & Frontend

Diretrizes visuais para manter a experiência premium.

- **[Design System](./frontend/DESIGN_SYSTEM.md)**: Cores, tipografia e tokens visuais.
- **[Padrões Financeiros UI](./frontend/PADROES_FINANCEIROS_UI.md)**: Como exibir moedas, períodos e tabelas financeiras.
- **[Componentes Reutilizáveis](./frontend/REUSABLE_COMPONENTS.md)**: Biblioteca de componentes core (Layout, Cards, Tables).
- **[Estados de Carregamento](./frontend/LOADING_STATES.md)**: Implementação de Skeletons e Spinners.

## ⚙️ Funcionalidades & Integrações

- **[Integração WhatsApp](./WHATSAPP_INTEGRATION.md)**: Fluxos automáticos via Twilio e manuais via API Link.
- **[Sistema de Faturamento](./frontend/BILLING_SYSTEM.md)**: Lógica de geração de cobranças e conciliação.
- **[Configuração de Email](./EMAIL_CONFIGURATION.md)**: Setup de provedores e templates.

## 💼 Regras de Negócio

- **[Dicionário de Regras](./business_rules/BUSINESS_RULES.md)**: Limites de vagas, cálculos de lucro e ciclos de faturamento.
- **[Casos de Uso](./AUDITORIA_E_DOCUMENTACAO.md#22-mapeamento-de-casos-de-uso-uc)**: Fluxos principais da aplicação.

---

> [!TIP]
> **Consistência é chave.** Antes de criar um novo componente financeiro, revise os [Padrões de UI](./frontend/PADROES_FINANCEIROS_UI.md) para garantir que ícones e tipografia seguem o padrão dashboard premium.
