# 🧪 Guia de Testes - Quantum Ledger

## 📋 Visão Geral

O Quantum Ledger possui um **sistema de cenários de teste determinísticos** que permite testar diferentes condições de mercado de forma **previsível e controlada**.

## 🎯 Cenários Disponíveis

### Como Usar

Você pode ativar cenários de 3 formas:

1. **Query Parameter na URL**: `?scenario=bull_market`
2. **Botão "Test Scenarios"** no header (canto superior direito)
3. **Test Mode** (legado): `?test_mode=true` (equivalente a `scenario=fixed`)

---

## 📊 Lista Completa de Cenários

### 1. `fixed` - Preços Fixos
```
URL: ?scenario=fixed
ou: ?test_mode=true
```

**Comportamento**: Todos os preços e taxas de câmbio são **completamente fixos**. Nenhuma variação.

**Uso**: Testes que precisam de valores 100% estáveis e previsíveis.

**Valores Fixos**:
- AAPL: $175.50
- GOOGL: $142.30
- MSFT: $380.75
- TSLA: $238.45
- AMZN: $156.88
- USD-BRL: 5.123456
- USD-EUR: 0.923456

---

### 2. `bull_market` - Mercado em Alta
```
URL: ?scenario=bull_market
```

**Comportamento**: Preços sobem **0.5% a cada tick** (a cada 3 segundos).

**Fórmula**: `Preço Novo = Preço Base × (1.005)^tickCount`

**Uso**: Testar como a aplicação responde a:
- Crescimento contínuo do patrimônio
- Aumento de ganhos nos investimentos
- Fortalecimento do USD (outras moedas ficam mais baratas)

**Exemplo**:
```
Tick 0: AAPL = $175.50
Tick 1: AAPL = $176.38 (+0.5%)
Tick 2: AAPL = $177.26 (+0.5%)
Tick 3: AAPL = $178.15 (+0.5%)
```

---

### 3. `bear_market` - Mercado em Queda
```
URL: ?scenario=bear_market
```

**Comportamento**: Preços caem **0.3% a cada tick**.

**Fórmula**: `Preço Novo = Preço Base × (0.997)^tickCount`

**Uso**: Testar como a aplicação responde a:
- Diminuição do patrimônio
- Prejuízos nos investimentos
- Enfraquecimento do USD (outras moedas ficam mais caras)

**Exemplo**:
```
Tick 0: AAPL = $175.50
Tick 1: AAPL = $174.97 (-0.3%)
Tick 2: AAPL = $174.45 (-0.3%)
Tick 3: AAPL = $173.92 (-0.3%)
```

---

### 4. `volatile` - Alta Volatilidade
```
URL: ?scenario=volatile
```

**Comportamento**: Oscilação de **±2% alternada** (padrão previsível).

**Padrão**: +2%, -2%, +2%, -2%, +2%, -2%...

**Uso**: Testar:
- Mudanças rápidas de preço
- Atualização da UI em tempo real
- Cálculos de ganho/perda com grandes variações

**Exemplo**:
```
Tick 0: AAPL = $175.50
Tick 1: AAPL = $179.01 (+2%)
Tick 2: AAPL = $175.43 (-2%)
Tick 3: AAPL = $178.94 (+2%)
Tick 4: AAPL = $175.36 (-2%)
```

---

### 5. `stable` - Mercado Estável
```
URL: ?scenario=stable
```

**Comportamento**: Variações **mínimas de ±0.1%** usando função senoidal.

**Fórmula**: `variação = sin(tickCount × 0.1) × 0.001`

**Uso**: Testar:
- Mercado com pouco movimento
- Micro variações que não devem afetar saldos significativamente

**Exemplo**:
```
Tick 0: AAPL = $175.50
Tick 1: AAPL = $175.52 (+0.01%)
Tick 2: AAPL = $175.53 (+0.02%)
Tick 3: AAPL = $175.52 (+0.01%)
```

---

### 6. `crash` - Crash do Mercado
```
URL: ?scenario=crash
```

**Comportamento**: **Queda súbita de 20%** no primeiro tick, depois estabiliza.

**Uso**: Testar:
- Reação a eventos extremos
- Cálculos de prejuízo massivo
- Impostos em cenário de perda

**Exemplo**:
```
Tick 0: AAPL = $175.50
Tick 1: AAPL = $140.40 (-20%) ⚠️ CRASH
Tick 2: AAPL = $140.40 (estável)
Tick 3: AAPL = $140.40 (estável)
```

---

### 7. `rally` - Rally do Mercado
```
URL: ?scenario=rally
```

**Comportamento**: **Alta súbita de 15%** no primeiro tick, depois pequenas altas de 0.2% por tick.

**Uso**: Testar:
- Reação a eventos positivos extremos
- Cálculos de ganhos massivos
- Impostos em cenário de grande ganho

**Exemplo**:
```
Tick 0: AAPL = $175.50
Tick 1: AAPL = $201.83 (+15%) 📈 RALLY
Tick 2: AAPL = $202.23 (+0.2%)
Tick 3: AAPL = $202.64 (+0.2%)
```

---

### 8. `interest_hike` - Aumento de Juros
```
URL: ?scenario=interest_hike
```

**Comportamento**:
- Ações caem **0.2% por tick** (reação negativa ao aumento de juros)
- USD se fortalece: taxas de câmbio caem **1% por tick**

**Uso**: Testar:
- Impacto de política monetária
- Conversão de moeda com USD fortalecido
- Transferências internacionais

**Exemplo**:
```
Ações:
Tick 0: AAPL = $175.50
Tick 1: AAPL = $175.15 (-0.2%)

Câmbio:
Tick 0: USD-BRL = 5.123456
Tick 1: USD-BRL = 5.072282 (-1%) -> Comprar BRL ficou mais barato
```

---

### 9. `interest_cut` - Corte de Juros
```
URL: ?scenario=interest_cut
```

**Comportamento**:
- Ações sobem **0.3% por tick** (reação positiva ao corte de juros)
- USD se enfraquece: taxas de câmbio sobem **0.5% por tick**

**Uso**: Testar:
- Impacto de política monetária
- Conversão de moeda com USD enfraquecido
- Rebalanceamento de portfólio

**Exemplo**:
```
Ações:
Tick 0: AAPL = $175.50
Tick 1: AAPL = $176.03 (+0.3%)

Câmbio:
Tick 0: USD-BRL = 5.123456
Tick 1: USD-BRL = 5.149073 (+0.5%) -> Comprar BRL ficou mais caro
```

---

## 🧮 Como Funcionam os Ticks

**Tick** = uma atualização de preço.

- **Intervalo**: A cada **3 segundos** (UPDATE_INTERVAL)
- **Tick Count**: Contador que aumenta a cada atualização
- **Exibição**: Visível no banner do cenário (canto superior direito do card)

### Exemplo Prático:

```
t=0s:  Tick 0  → Preços iniciais
t=3s:  Tick 1  → Primeira atualização
t=6s:  Tick 2  → Segunda atualização
t=9s:  Tick 3  → Terceira atualização
...
```

---

## 🔍 Casos de Teste Sugeridos

### Teste de Precisão Numérica

```bash
# 1. Cenário fixo
?scenario=fixed

# Validar:
- Saldos de conta permanecem exatamente iguais
- Conversões de moeda com 6 casas decimais corretas
- Cálculos de ganho/perda são exatos
```

### Teste de Bull Market

```bash
# 2. Mercado em alta
?scenario=bull_market

# Validar após 10 ticks (30 segundos):
- Patrimônio líquido aumentou ~5% (10 × 0.5%)
- Ganhos de investimento calculados corretamente
- Estimativa de impostos atualizada
```

### Teste de Crash

```bash
# 3. Crash do mercado
?scenario=crash

# Validar no Tick 1:
- Patrimônio caiu ~20% (imediatamente)
- Prejuízos calculados corretamente
- Não há cálculo de imposto (pois houve perda)
- Saldos de conta não mudaram (apenas investimentos)
```

### Teste de Conversão de Moeda

```bash
# 4. Aumento de juros
?scenario=interest_hike

# Validar após 5 ticks:
- Taxa USD-BRL caiu ~5% (5 × 1%)
- Transferir $1000 USD agora dá MAIS BRL
- Conversão exibe taxa correta com 6 casas decimais
```

### Teste de Tabela de Amortização

```bash
# 5. Cenário fixo
?scenario=fixed

# Ir para Loan Calculator:
- Valor: $100,000
- Taxa: 5.5%
- Prazo: 360 meses

# Validar:
- Pagamento mensal: $567.79
- Última linha da tabela tem saldo = $0.00
- Soma de juros + principal = pagamento mensal (sempre)
```

---

## 🎨 Visualização dos Cenários

Quando um cenário está ativo, você verá:

1. **Banner azul** no topo do Dashboard
2. **Nome do cenário** (ex: "BULL MARKET")
3. **Descrição** (ex: "Mercado em alta - preços sobem 0.5% a cada tick")
4. **Tick Count** (contador de atualizações)

---

## 🔧 Dicas para QA

### Testes Determinísticos

✅ **Use cenários** ao invés de modo normal para testes automatizados
✅ **Documente o tick count** em cada asserção
✅ **Teste edge cases** (ex: Tick 0 vs Tick 1 no crash)

### Comparação de Valores

```javascript
// ❌ Não faça isso (valores flutuantes)
expect(balance).toBe(175.50);

// ✅ Faça isso (use a biblioteca de moeda)
expect(balance.format()).toBe('$ 175.50');
```

### Teste de Variações

```javascript
// Bull Market: validar crescimento
const priceAtTick0 = getPrice(0);  // $175.50
const priceAtTick10 = getPrice(10); // $176.38 × 1.005^9

const expectedGrowth = priceAtTick0 * (1.005 ** 10);
expect(priceAtTick10).toBeCloseTo(expectedGrowth, 2);
```

---

## 📊 Monitoramento

### Data Test IDs Úteis

- `data-testid="test-mode-banner"` - Banner do cenário
- `data-testid="tick-count"` - Contador de ticks
- `data-testid="total-net-worth"` - Patrimônio líquido
- `data-testid="stock-ticker-{SYMBOL}"` - Preço de ação
- `data-testid="exchange-rate"` - Taxa de câmbio

---

## 🚀 Quick Start

```bash
# 1. Iniciar aplicação
npm run dev

# 2. Acessar com cenário
http://localhost:3000?scenario=bull_market

# 3. Observar banner azul com informações do cenário

# 4. Aguardar alguns ticks (3s cada)

# 5. Validar cálculos em tempo real
```

---

## 🎯 Resumo dos Cenários

| Cenário | Ações | Câmbio | Uso Principal |
|---------|-------|--------|---------------|
| `fixed` | Fixos | Fixos | Testes estáveis |
| `bull_market` | +0.5%/tick | USD ↑ | Crescimento |
| `bear_market` | -0.3%/tick | USD ↓ | Queda |
| `volatile` | ±2% alternado | ±1% alternado | Volatilidade |
| `stable` | ±0.1% senoidal | ±0.05% senoidal | Estabilidade |
| `crash` | -20% súbito | USD ↑ 10% | Evento extremo |
| `rally` | +15% súbito | USD ↓ 5% | Evento positivo |
| `interest_hike` | -0.2%/tick | USD ↑ 1%/tick | Política monetária |
| `interest_cut` | +0.3%/tick | USD ↓ 0.5%/tick | Política monetária |

---

**Quantum Ledger** - Ambiente controlado para testes financeiros realistas! 🎲
