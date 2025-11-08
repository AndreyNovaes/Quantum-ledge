# 🧪 Guia de QA - Quantum Ledger

## 🎯 Objetivo

Validar **REGRAS DE NEGÓCIO** e **CÁLCULOS FINANCEIROS** com dados fixos e previsíveis.

## 📋 Modo de Teste

```
URL: ?test_mode=true
```

**O que faz:**
- ✅ Preços **completamente fixos** (nunca mudam)
- ✅ Taxas de câmbio **fixas**
- ✅ Sem `Math.random()` - 100% determinístico
- ✅ Mesmo input = mesmo output (sempre)

---

## 🧮 Casos de Teste Críticos

### 1. Precisão Numérica (Floating-Point)

**Problema Real:**
```javascript
0.1 + 0.2 = 0.30000000000000004 ❌
```

**Nossa Solução:**
```javascript
new Money('0.1', 'USD').add(new Money('0.2', 'USD'))
// Resultado: Money('0.3', 'USD') ✅
```

**Como Testar:**
1. Acesse: `?test_mode=true`
2. Navegue para `/transfer`
3. Transfira $0.10 + $0.20
4. Valide que o total é **exatamente** $0.30

**Data Test ID:** `data-testid="amount"`

---

### 2. Conversão de Moeda (6 Casas Decimais)

**Regra:** Taxas de câmbio usam 6 casas decimais para precisão.

**Caso de Teste:**
```
Valor: $1,000.00 USD
Taxa: 5.123456 (USD → BRL)
Esperado: R$ 5,123.46 BRL
```

**Como Testar:**
1. Acesse: `?test_mode=true`
2. `/transfer`
3. De: US Dollar Checking ($15,234.56)
4. Para: Brazilian Real Checking (R$ 78,901.23)
5. Valor: 1000
6. Marcar: "Convert to BRL"
7. Validar:
   - `data-testid="exchange-rate"` = "5.123456"
   - `data-testid="converted-amount"` = "R$ 5,123.46"

---

### 3. Validação: Saldo Insuficiente

**Regra:** Não pode transferir mais do que tem na conta.

**Como Testar:**
1. `?test_mode=true`
2. `/transfer`
3. De: US Dollar Checking (saldo: $15,234.56)
4. Valor: 20000 (maior que saldo)
5. Validar:
   - `data-testid="submit-transfer"` está `disabled`
   - Mensagem de erro aparece

---

### 4. Validação: Mesma Conta

**Regra:** Não pode transferir para a mesma conta.

**Como Testar:**
1. `?test_mode=true`
2. `/transfer`
3. De: US Dollar Checking
4. Para: US Dollar Checking (mesma)
5. Validar: Erro "Cannot transfer to the same account"

---

### 5. Cálculo de Ganho/Perda em Investimentos

**Regra:**
```
Ganho/Perda = (Preço Atual - Preço de Compra) × Quantidade
```

**Dados Fixos (test_mode=true):**
```
AAPL:
- Quantidade: 50 ações
- Preço de Compra: $165.00
- Preço Atual: $175.50 (fixo)
- Ganho/Perda Esperado: (175.50 - 165.00) × 50 = $525.00
```

**Como Testar:**
1. `?test_mode=true`
2. `/investments`
3. Localizar linha AAPL
4. Validar:
   - `data-testid="asset-row-0-gain-loss"` = "$ 525.00"
   - `data-testid="asset-row-0-gain-loss-percent"` = "+6.36%"

---

### 6. Impostos sobre Ganhos de Capital

**Regra:**
- Taxa: 15% sobre **ganhos** (não sobre perdas)
- Se prejuízo → imposto = $0.00

**Caso 1: Ganho (deve cobrar imposto)**
```
AAPL: Ganho de $525.00
Imposto = 525.00 × 0.15 = $78.75
```

**Caso 2: Prejuízo (NÃO deve cobrar imposto)**
```
TSLA:
- Compra: $245.00 × 15 = $3,675.00
- Atual: $238.45 × 15 = $3,576.75
- Perda: -$98.25
- Imposto: $0.00 ✅ (sem imposto em perda)
```

**Como Testar:**
1. `?test_mode=true`
2. `/investments`
3. Scroll até "Estimated Capital Gains Tax"
4. Validar que TSLA **NÃO** aparece na lista (pois tem prejuízo)
5. Validar AAPL imposto: `data-testid="tax-row-0-amount"` = "$ 78.75"

---

### 7. Tabela de Amortização

**Regra Crítica:** Última parcela DEVE ter saldo = $0.00

**Caso de Teste:**
```
Valor: $100,000.00
Taxa: 5.5% ao ano
Prazo: 360 meses (30 anos)
```

**Valores Esperados:**
- Pagamento Mensal: **$567.79**
- Total de Juros: **$104,406.40**
- Total Pago: **$204,406.40**

**Como Testar:**
1. `?test_mode=true`
2. `/tools/loan-calculator`
3. Preencher valores acima
4. Clicar "Calculate Amortization"
5. Validar:
   - `data-testid="monthly-payment"` = "$ 567.79"
   - `data-testid="total-interest"` = "$ 104,406.40"
6. Scroll até última linha da tabela (linha 359, período 360)
7. Validar: `data-testid="amortization-row-359-balance"` = "$ 0.00" ✅

---

### 8. Formatação i18n (Internacionalização)

**Regra:** Cada moeda tem formato específico.

| Moeda | Formato Esperado | Separador Milhares | Separador Decimal |
|-------|------------------|---------------------|-------------------|
| USD   | $ 1,234.56       | `,` (vírgula)       | `.` (ponto)       |
| BRL   | R$ 1.234,56      | `.` (ponto)         | `,` (vírgula)     |
| EUR   | € 1.234,56       | `.` (ponto)         | `,` (vírgula)     |

**Como Testar:**
1. `?test_mode=true`
2. Dashboard `/`
3. Validar cada conta:
   - `data-testid="account-0-balance"` = "$ 15,234.56" (USD)
   - `data-testid="account-2-balance"` = "R$ 78.901,23" (BRL)
   - `data-testid="account-3-balance"` = "€ 23.456,78" (EUR)

---

### 9. Patrimônio Líquido Total (Multi-Moeda)

**Regra:** Somar todas as contas + investimentos (convertendo para USD).

**Cálculo:**
```
Contas:
- USD Checking: $15,234.56
- USD Savings: $45,678.90
- BRL Checking: R$ 78,901.23 × 0.195186 = $15,400.12
- EUR Savings: €23,456.78 × 1.082945 = $25,401.89

Investimentos:
- AAPL: 50 × $175.50 = $8,775.00
- GOOGL: 25 × $142.30 = $3,557.50
- MSFT: 30 × $380.75 = $11,422.50
- TSLA: 15 × $238.45 = $3,576.75

Total = Contas + Investimentos
```

**Como Testar:**
1. `?test_mode=true`
2. Dashboard `/`
3. Validar `data-testid="total-net-worth"`
4. Verificar cálculo manual

---

### 10. Exportação de Relatórios

**Regra:** Dados exportados devem corresponder exatamente aos exibidos.

**Como Testar CSV:**
1. `?test_mode=true`
2. `/reports`
3. Filtrar: 2025-01-01 a 2025-12-31
4. Clicar `data-testid="export-csv"`
5. Abrir CSV
6. Validar:
   - Mesmo número de transações
   - Valores formatados corretamente
   - Datas no formato ISO (2025-01-10T10:30:00Z)

**Como Testar PDF:**
1. Mesmo processo
2. Clicar `data-testid="export-pdf"`
3. Abrir PDF
4. Validar formatação da tabela

---

## 🔍 Edge Cases Importantes

### Edge Case 1: Valor Zero
```
Transfer: $0.00
Esperado: Botão desabilitado ou erro
```

### Edge Case 2: Valor Negativo
```
Input: -100
Esperado: Input não aceita (sanitizado)
```

### Edge Case 3: Conta Vazia
```
Saldo: $0.00
Transfer: $0.01
Esperado: Erro de saldo insuficiente
```

### Edge Case 4: Taxa de Câmbio Inversa
```
USD → BRL: 5.123456
BRL → USD: 0.195186 (1 / 5.123456)
Validar que conversão reversa está correta
```

---

## 📊 Valores Fixos no Test Mode

### Preços de Ações
- AAPL: $175.50
- GOOGL: $142.30
- MSFT: $380.75
- TSLA: $238.45
- AMZN: $156.88

### Taxas de Câmbio
- USD → BRL: 5.123456
- USD → EUR: 0.923456
- BRL → USD: 0.195186
- BRL → EUR: 0.180234
- EUR → USD: 1.082945
- EUR → BRL: 5.549123

### Saldos de Contas
- US Dollar Checking: $15,234.56
- US Dollar Savings: $45,678.90
- Brazilian Real Checking: R$ 78,901.23
- Euro Savings: €23,456.78

---

## ✅ Checklist de Testes

- [ ] Precisão numérica (0.1 + 0.2 = 0.3)
- [ ] Conversão de moeda (6 casas decimais)
- [ ] Saldo insuficiente bloqueia transferência
- [ ] Mesma conta bloqueia transferência
- [ ] Ganho/perda calculado corretamente
- [ ] Imposto apenas em ganhos (não em perdas)
- [ ] Última parcela do empréstimo = $0.00
- [ ] Formatação i18n correta (USD, BRL, EUR)
- [ ] Patrimônio líquido soma todas moedas
- [ ] CSV/PDF exportam dados corretos

---

## 🚀 Quick Start

```bash
npm run dev

# Acesse em modo de teste:
http://localhost:3000?test_mode=true

# Todos os valores são FIXOS e PREVISÍVEIS
```

---

**Foco: REGRAS DE NEGÓCIO, não simulação de mercado!** ✅
