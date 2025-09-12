# 🧮 Cálculo Automático del Costo Total en SCHEDAX

## ✨ Funcionalidad Implementada

### **🎯 Cálculo Automático Inteligente**

El sistema ahora calcula **automáticamente** el costo total de la carrera basado en:

#### Para Sistema de Créditos:
```
Costo Total = Total de Créditos × Costo por Crédito
```

#### Para Sistema de Períodos:
```
Costo Total = Total de Períodos × Costo por Período
```

---

## 📱 **Experiencia del Usuario**

### **Escenario 1: Cálculo Automático Silencioso**
```
1. Usuario selecciona "Sistema de Créditos"
2. Ingresa "Total de Créditos: 240"
3. Ingresa "Costo por Crédito: DOP$2,000"
4. 🧮 Sistema calcula automáticamente: 240 × DOP$2,000 = DOP$480,000
5. Campo "Costo Total" se completa automáticamente
6. Aparece indicador visual "(Calculado automáticamente)" 🧮
```

### **Escenario 2: Sugerencia de Cálculo**
```
Campo Costo Total muestra:
┌─────────────────────────────────────────────┐
│ Costo Total de la Carrera (Calculado automáticamente) │
│ DOP$ [480000] 🧮                            │
│                                             │
│ Cálculo automático: 240 créditos ×         │
│ DOP$2,000 = DOP$480,000                    │
│ [🧮 Calcular Automáticamente]               │
│                                             │
│ ✅ Costo Total Configurado                  │
│ DOP$480,000 (240 créditos × DOP$2,000)     │
└─────────────────────────────────────────────┘
```

### **Escenario 3: Sistema de Períodos**
```
1. Usuario selecciona "Sistema de Períodos - Semestres"
2. Ingresa "Total de Semestres: 10"
3. Ingresa "Costo por Semestre: DOP$50,000"
4. 🧮 Sistema calcula automáticamente: 10 × DOP$50,000 = DOP$500,000
5. Campo se completa con indicador verde
```

---

## 🔧 **Características Técnicas**

### **Auto-detección:**
- ✅ **Cálculo en tiempo real** cuando se completan los campos
- ✅ **Actualización automática** si cambian los valores base
- ✅ **Indicador visual** de cálculo automático vs manual

### **Flexibilidad:**
- ✅ **Edición manual permitida** (el usuario puede sobrescribir)
- ✅ **Recálculo automático** si cambian los parámetros
- ✅ **Sugerencias inteligentes** en placeholder

### **Validación:**
- ✅ **Coherencia automática** entre valores
- ✅ **Detección de cambios** manuales vs automáticos
- ✅ **Preservación de datos** del usuario

---

## 🎨 **Indicadores Visuales**

### **Campo con Cálculo Automático:**
```
┌─────────────────────────────────────────────┐
│ Costo Total (Calculado automáticamente)    │
│ DOP$ [480000] 🧮                            │
│ ↑ Verde claro ↑ Icono                      │
└─────────────────────────────────────────────┘
```

### **Campo Manual:**
```
┌─────────────────────────────────────────────┐
│ Costo Total de la Carrera                  │
│ DOP$ [_____]                                │
│ ↑ Normal                                    │
└─────────────────────────────────────────────┘
```

### **Estados del Campo:**
- 🟢 **Verde + 🧮**: Calculado automáticamente
- ⚪ **Normal**: Ingreso manual
- 🔵 **Azul**: Sugerencia disponible

---

## 📊 **Flujos de Cálculo**

### **Flujo Principal:**
```
Cambio en campos base
       ↓
Detectar si se puede calcular
       ↓
Calcular automáticamente
       ↓
Actualizar campo + marcar como automático
       ↓
Mostrar indicador visual
```

### **Flujo de Sobrescritura:**
```
Usuario edita costo total manualmente
       ↓
Marcar como manual (no automático)
       ↓
Quitar indicador verde
       ↓
Preservar valor manual hasta nuevo cálculo
```

---

## 💡 **Beneficios del Sistema**

1. **🚀 Eficiencia**: No necesita calculadora externa
2. **✅ Precisión**: Cálculos automáticos sin errores
3. **🔄 Coherencia**: Valores siempre sincronizados
4. **👁️ Transparencia**: Muestra cómo se calculó
5. **🎯 Flexibilidad**: Permite modificación manual
6. **📱 UX Intuitiva**: Indicadores visuales claros

### **Ejemplo Completo:**
```
Usuario quiere una carrera de:
• 8 semestres
• DOP$60,000 por semestre

Sistema automáticamente:
1. Calcula: 8 × DOP$60,000 = DOP$480,000
2. Completa el campo total
3. Muestra "(Calculado automáticamente)" 🧮
4. Aplica fondo verde al campo
5. Permite edición si el usuario quiere ajustar

¡El usuario ya no necesita hacer cálculos manuales!
```

El sistema de **cálculo automático** hace que configurar los costos sea **instantáneo y preciso**.
