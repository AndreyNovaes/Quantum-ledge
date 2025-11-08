# Quantum Ledger - Personal Finance & Investment Dashboard

Uma aplicação FinTech projetada especificamente para **desafiar times de QA** com cenários realistas de testes financeiros.

## 🎯 Objetivo

Este projeto não foi construído apenas para ser bonito - foi construído para ser um **campo minado de desafios de teste** que refletem problemas reais encontrados em software financeiro de produção.

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **UI**: React 18
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Manipulação de Moeda**: Decimal.js (precisão decimal)

## 🚀 Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar build de produção
npm start

# Verificar tipos TypeScript
npm run type-check
```

A aplicação estará disponível em `http://localhost:3000`

## 🧪 Modo de Teste

Para testes determinísticos, acesse a aplicação com o parâmetro de query:

```
http://localhost:3000?test_mode=true
```

No **modo de teste**:
- Todos os preços de ações são congelados em valores fixos
- Todas as taxas de câmbio são fixas
- Não há volatilidade nos dados
- Permite validações reproduzíveis

## 🎲 Desafios de QA Implementados

### 1. Precisão Numérica (Floating-Point Hell)

**PROIBIDO** o uso de `number` nativo do JavaScript para cálculos financeiros.

- Todos os valores monetários usam `Decimal.js` ou são armazenados como inteiros (centavos)
- Teste: `0.1 + 0.2 = 0.3` (não `0.30000000000000004`)
- Localização: `lib/currency.ts`

**Pontos de Teste**:
- Cálculos de saldo de conta
- Conversão de moeda
- Cálculo de juros compostos
- Tabela de amortização

### 2. Dados Dinâmicos e Voláteis

A aplicação simula um feed de mercado de ações em tempo real:

- Preços atualizam a cada 3 segundos no modo normal
- Modo de teste congela todos os valores
- Parâmetro: `?test_mode=true`

**Pontos de Teste**:
- `data-testid="stock-ticker-{SYMBOL}"`
- Cálculos de ganho/perda em tempo real
- Valor líquido total recalculado

### 3. Cálculos Financeiros Complexos

#### Juros Compostos
- Calculadora de projeção de investimentos
- Localização: `lib/currency.ts` - `calculateCompoundInterest()`

#### Conversão de Moeda
- Taxas com 6 casas decimais
- Conversão bidirecional (USD ↔ BRL ↔ EUR)
- Localização: `/transfer` page

**Pontos de Teste**:
- `data-testid="exchange-rate"`
- `data-testid="converted-amount"`

#### Cálculo de Impostos
- Simulação de imposto sobre ganhos de capital (15%)
- Localização: `/investments` page

**Pontos de Teste**:
- `data-testid="tax-row-{index}-amount"`

#### Amortização
- Tabela completa de amortização de empréstimos
- Cada parcela mostra: juros, principal, saldo devedor
- Localização: `/tools/loan-calculator`

**Pontos de Teste**:
- `data-testid="amortization-table"`
- `data-testid="amortization-row-{index}-payment"`
- `data-testid="amortization-row-{index}-principal"`
- `data-testid="amortization-row-{index}-interest"`
- `data-testid="amortization-row-{index}-balance"`

### 4. Transações e Condições de Corrida

Fluxo de transferência projetado para testar atomicidade:

- Validação de saldo insuficiente
- Botão desabilitado quando inválido
- Modal de confirmação com todos os detalhes
- Simulação de delay de API

**Pontos de Teste**:
- `data-testid="submit-transfer"` (deve estar desabilitado se saldo insuficiente)
- Teste de cliques rápidos para detectar duplicação
- Validação de rollback em caso de falha

### 5. Localização e Internacionalização (i18n)

Suporte a 3 moedas com formatação correta:

- **USD**: $1,234.56 (en-US)
- **BRL**: R$ 1.234,56 (pt-BR)
- **EUR**: €1.234,56 (de-DE)

**Pontos de Teste**:
- Formatação de números
- Separadores decimais e de milhares
- Posicionamento do símbolo de moeda

### 6. Geração de Relatórios e Exportação

Exportação de extratos para CSV e PDF:

- Filtros de data
- Filtros de tipo de transação
- Formatação correta dos dados

**Pontos de Teste**:
- `data-testid="export-csv"`
- `data-testid="export-pdf"`
- Validação de integridade dos dados exportados

## 📊 Páginas da Aplicação

### Dashboard (`/`)
- Patrimônio líquido total (soma de todas as contas + investimentos)
- Gráfico de evolução do portfólio
- Lista de contas com saldos
- Últimas 5 transações

**Pontos de Teste**:
- `data-testid="total-net-worth"`
- `data-testid="net-worth-change"`
- `data-testid="account-{index}-balance"`

### Transferência (`/transfer`)
- Transferência entre contas
- Conversão de moeda opcional
- Validação de saldo
- Modal de confirmação

**Pontos de Teste**:
- `data-testid="from-account"`
- `data-testid="to-account"`
- `data-testid="amount"`
- `data-testid="exchange-rate"`
- `data-testid="converted-amount"`
- `data-testid="submit-transfer"`

### Investimentos (`/investments`)
- Tabela de ativos com preços em tempo real
- Cálculo de ganho/perda por ativo
- Implicações fiscais estimadas

**Pontos de Teste**:
- `data-testid="total-investment-value"`
- `data-testid="asset-row-{index}-gain-loss"`
- `data-testid="stock-ticker-{SYMBOL}"`

### Calculadora de Empréstimos (`/tools/loan-calculator`)
- Inputs para valor, taxa e prazo
- Tabela de amortização completa
- Resumo com juros totais

**Pontos de Teste**:
- `data-testid="monthly-payment"`
- `data-testid="total-interest"`
- `data-testid="amortization-table"`

### Relatórios (`/reports`)
- Filtros de data e tipo
- Exportação CSV e PDF

**Pontos de Teste**:
- `data-testid="transaction-count"`
- `data-testid="export-csv"`
- `data-testid="export-pdf"`

## 🧬 Arquitetura

```
quantum-ledger/
├── app/                    # Páginas Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Dashboard
│   ├── transfer/          # Transferência de fundos
│   ├── investments/       # Portfólio de investimentos
│   ├── tools/
│   │   └── loan-calculator/
│   └── reports/           # Geração de relatórios
├── components/
│   ├── ui/                # Componentes genéricos
│   ├── dashboard/
│   ├── investments/
│   └── reports/
├── lib/
│   ├── types.ts           # Tipos TypeScript
│   ├── currency.ts        # Biblioteca de moeda (CRÍTICO)
│   ├── mock-data.ts       # Dados mockados estáveis
│   └── MarketDataContext.tsx
└── hooks/
    └── useMarketData.ts   # Hook para dados voláteis
```

## 🎨 Data Test IDs Principais

Todos os elementos críticos possuem `data-testid` para facilitar testes automatizados:

- Valores monetários
- Botões de ação
- Campos de formulário
- Linhas de tabela
- Elementos dinâmicos

## 🔐 Requisitos de Segurança

- Nenhum cálculo financeiro usa `number` nativo
- Validação de saldo antes de transferências
- Confirmação obrigatória para transações
- Sanitização de inputs numéricos

## 📝 Notas para QA

1. **Sempre teste no modo de teste primeiro** (`?test_mode=true`) para valores determinísticos
2. **Valide precisão decimal** em todos os cálculos financeiros
3. **Teste conversão de moeda** com taxas de múltiplas casas decimais
4. **Valide tabela de amortização** célula por célula
5. **Teste race conditions** com cliques rápidos
6. **Valide exportações** (CSV e PDF) para integridade de dados
7. **Teste formatação i18n** para cada moeda

## 🐛 Cenários de Teste Sugeridos

### Precisão Numérica
```typescript
// Deve resultar em exatamente 0.3, não 0.30000000000000004
0.1 + 0.2 = 0.3
```

### Conversão de Moeda
```typescript
// Taxa: 5.123456 (6 casas decimais)
$100.00 USD → R$ 512.35 BRL
```

### Tabela de Amortização
```typescript
// Último período deve ter saldo ZERO
amortizationSchedule[last].balance === $0.00
```

## 📄 Licença

Este projeto é uma plataforma de testes para fins educacionais.

---

**Quantum Ledger** - Onde a complexidade financeira encontra a qualidade de software.
