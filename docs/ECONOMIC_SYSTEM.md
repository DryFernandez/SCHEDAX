# 💰 Sistema de Valor Económico en SCHEDAX

## 📊 Funcionalidades Implementadas

### 🎯 **StatisticsScreen - Configuración Económica**

#### Campos Principales:
- **Costo Total de la Carrera**: Monto completo de matrícula
- **Monto ya Pagado**: Lo que has abonado hasta ahora
- **Costo por Crédito/Período**: Calculado automáticamente o manual

#### Gastos Adicionales Opcionales:
- **📚 Libros por período**: Costo de materiales académicos
- **🚗 Transporte mensual**: Gastos de movilidad
- **📝 Extras por período**: Proyectos, laboratorios, etc.

### 📈 **AnalyticsScreen - Estadísticas Económicas**

#### Progreso Económico:
- Costo total vs pagado
- Porcentaje de progreso de pagos
- Monto restante por pagar

#### Estimaciones Inteligentes:
- Costo restante por créditos
- Costo restante por períodos
- Gastos adicionales proyectados
- Inversión total restante

---

## 💡 **Ejemplos de Uso**

### Ejemplo 1: Sistema de Créditos
```
Configuración:
• Total créditos: 240
• Costo total: DOP$500,000
• Costo por crédito: DOP$2,083 (automático)
• Pagado: DOP$250,000
• Créditos completados: 120

Estadísticas mostradas:
📊 Progreso Total: 50.0% (Por créditos)
💳 Pagado: DOP$250K (50.0% del total)
📊 Restante: DOP$250K
🎓 Por Crédito: DOP$2,083
   Faltan: DOP$250K (120 créditos)
```

### Ejemplo 2: Sistema de Períodos + Gastos
```
Configuración:
• Total semestres: 10
• Costo total: DOP$400,000
• Costo por semestre: DOP$40,000
• Pagado: DOP$200,000
• Semestres completados: 5
• Libros por semestre: DOP$5,000
• Transporte mensual: DOP$2,000

Estadísticas mostradas:
📊 Progreso Total: 50.0% (Por períodos)
💳 Pagado: DOP$200K (50.0% del total)
📅 Por Semestre: DOP$40K
   Faltan: DOP$200K (5 semestres)

💸 Gastos Adicionales Restantes:
📚 Libros: DOP$25,000 (5 semestres × DOP$5,000)
🚗 Transporte: DOP$60,000 (30 meses × DOP$2,000)
Total adicional: DOP$85,000

🎯 Inversión Total Restante: DOP$285,000
```

---

## 🔧 **Funcionalidades Técnicas**

### Cálculos Automáticos:
1. **Valor por unidad**: Costo total ÷ unidades totales
2. **Progreso de pago**: (Pagado ÷ Total) × 100
3. **Gastos proyectados**: Unidades restantes × costo unitario
4. **Transporte inteligente**: Meses restantes × costo mensual

### Sugerencias Automáticas:
- Botón "Usar valor sugerido" para costos unitarios
- Cálculo automático basado en total y unidades
- Validación de coherencia entre campos

### Visualización Inteligente:
- Formato de moneda en miles (DOP$250K)
- Colores diferenciados por tipo de gasto
- Progreso visual con porcentajes
- Desglose detallado de gastos adicionales

---

## 📱 **Interfaz de Usuario**

### StatisticsScreen:
```
┌─────────────────────────────────────────────┐
│ 💰 Información Económica (Opcional)        │
│                                             │
│ Costo Total: DOP$ [500000]                 │
│ Monto Pagado: DOP$ [250000]                │
│ Costo por Crédito: [2083]                  │
│ [Usar valor sugerido (DOP$2,083)]          │
│                                             │
│ ☑️ Incluir costo de libros                  │
│    Libros por período: DOP$ [5000]         │
│ ☑️ Incluir costo de transporte              │
│    Transporte mensual: DOP$ [2000]         │
│ ☐ Incluir gastos extras                    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 💡 Resumen Económico                    │ │
│ │ Costo total: DOP$500,000                │ │
│ │ Pagado: DOP$250,000                     │ │
│ │ Restante: DOP$250,000                   │ │
│ │ Progreso de pago: 50.0%                 │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### AnalyticsScreen:
```
┌─────────────────────────────────────────────┐
│ 📈 Progreso Económico                      │
│                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │💰 DOP$500K  │ │💳 DOP$250K  │ │📊 250K  │ │
│ │Costo Total  │ │50% del total│ │Restante │ │
│ └─────────────┘ └─────────────┘ └─────────┘ │
│                                             │
│ ┌─────────────┐                             │
│ │🎓 DOP$2,083 │                             │
│ │Por Crédito  │                             │
│ │Faltan: 250K │                             │
│ └─────────────┘                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 💡 Estimaciones Económicas                  │
│                                             │
│ 💳 Progreso de Pagos                        │
│ Has pagado DOP$250,000 de DOP$500,000      │
│ (50.0% del costo total)                     │
│ Restante: DOP$250,000                       │
│                                             │
│ 🎓 Por Créditos Restantes                   │
│ Te faltan 120 créditos a DOP$2,083 c/u =   │
│ DOP$250,000                                 │
│                                             │
│ 💸 Gastos Adicionales Restantes             │
│ 📚 Libros: DOP$25,000                       │
│ 🚗 Transporte: DOP$60,000                   │
│ Total adicional: DOP$85,000                 │
│                                             │
│ 🎯 Inversión Total Restante                 │
│ DOP$335,000                                 │
│ Incluye matrícula y gastos adicionales      │
└─────────────────────────────────────────────┘
```

---

## 🎯 **Beneficios del Sistema**

1. **📊 Planificación Financiera**: Conoce exactamente cuánto necesitas
2. **💡 Decisiones Informadas**: Compara costo vs progreso académico
3. **🎯 Metas Claras**: Visualiza el progreso de pagos
4. **📈 Proyecciones Realistas**: Incluye todos los gastos asociados
5. **💰 Control Total**: Desde matrícula hasta gastos diarios

El sistema de valor económico te permite tener **control total** sobre la inversión en tu educación, con cálculos precisos y proyecciones realistas.
