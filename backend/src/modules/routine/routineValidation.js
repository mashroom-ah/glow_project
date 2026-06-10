const GROUP_ORDER = {
    cleansing: 1,
    peeling: 2,          // отшелушивание
    anti_acne: 3,
    hydration: 4,
    calming: 5,
    anti_age: 6,         // антивозрастной уход
};

const RUSSIAN = {
    cleansing: "очищение",
    peeling: "отшелушивание",
    anti_acne: "борьба с акне",
    hydration: "увлажнение",
    calming: "успокаивание",
    anti_age: "антивозрастной уход",
};

const COMPONENT_CONFLICTS = [
    // Ретинол + кислоты
    {
        components: ['retinol', 'aha'],
        severity: 'critical',
        message: 'Нельзя совмещать ретинол и AHA кислоты в одной рутине.',
    },
    {
        components: ['retinol', 'bha'],
        severity: 'critical',
        message: 'Нельзя совмещать ретинол и BHA кислоты в одной рутине.',
    },
    {
        components: ['retinol', 'pha'],
        severity: 'warning',
        message: 'Ретинол с PHA кислотами может увеличить чувствительность.',
    },
    // Ретиналь + кислоты
    {
        components: ['retinal', 'aha'],
        severity: 'critical',
        message: 'Нельзя совмещать ретиналь и AHA кислоты в одной рутине.',
    },
    {
        components: ['retinal', 'bha'],
        severity: 'critical',
        message: 'Нельзя совмещать ретиналь и BHA кислоты в одной рутине.',
    },
    {
        components: ['retinal', 'pha'],
        severity: 'warning',
        message: 'Ретиналь с PHA кислотами может увеличить чувствительность.',
    },
    // Витамин C + кислоты
    {
        components: ['vitamin_c', 'aha'],
        severity: 'warning',
        message: 'Витамин C с AHA кислотами может раздражать кожу.',
    },
    {
        components: ['vitamin_c', 'bha'],
        severity: 'warning',
        message: 'Витамин C с BHA кислотами может раздражать кожу.',
    },
    // Бензоил пероксид + ретинол/ретиналь
    {
        components: ['benzoyl_peroxide', 'retinol'],
        severity: 'critical',
        message: 'Бензоил пероксид и ретинол несовместимы, используйте в разное время суток.',
    },
    {
        components: ['benzoyl_peroxide', 'retinal'],
        severity: 'critical',
        message: 'Бензоил пероксид и ретиналь несовместимы, используйте в разное время суток.',
    },
    // Пептиды + кислоты (предупреждение)
    {
        components: ['peptides', 'aha'],
        severity: 'warning',
        message: 'Пептиды могут разрушаться в кислой среде, используйте их после тонера с pH > 5.',
    },
    {
        components: ['peptides', 'bha'],
        severity: 'warning',
        message: 'Пептиды могут разрушаться в кислой среде, используйте их после тонера с pH > 5.',
    },
    // Цинк + ретинол (предупреждение)
    {
        components: ['zinc', 'retinol'],
        severity: 'warning',
        message: 'Цинк может усилить раздражение от ретинола, используйте с осторожностью.',
    },
];

function validateRoutine(products) {
    const warnings = [];
    const critical_conflicts = [];
    const tips = [];

    // Проверка порядка групп
    for (let i = 0; i < products.length - 1; i++) {
        const current = products[i];
        const next = products[i + 1];
        const currentOrder = GROUP_ORDER[current.group_name];
        const nextOrder = GROUP_ORDER[next.group_name];
        if (currentOrder > nextOrder) {
            warnings.push({
                type: 'order',
                message: `Группа ${RUSSIAN[next.group_name]} должна быть до ${RUSSIAN[current.group_name]}`,
            });
        }
    }

    // Сбор уникальных активных компонентов
    const components = [...new Set(products.map(p => p.component_name).filter(Boolean))];

    // Проверка конфликтов
    for (const conflict of COMPONENT_CONFLICTS) {
        const hasAll = conflict.components.every(c => components.includes(c));
        if (hasAll) {
            const entry = {
                type: 'components',
                components: conflict.components,
                message: conflict.message,
            };
            if (conflict.severity === 'critical') {
                critical_conflicts.push(entry);
            } else {
                warnings.push(entry);
            }
        }
    }

    // Советы
    if (components.some(c => ['retinol', 'retinal'].includes(c))) {
        tips.push({
            message: 'Используйте SPF защиту по утрам, когда используете ретинол или ретиналь',
        });
    }
    if (components.some(c => ['aha', 'bha', 'pha'].includes(c))) {
        if (!components.includes('panthenol')) {
            tips.push({
                message: 'Пантенол может снизить раздражение от кислот',
            });
        }
        if (!components.includes('centella_asiatica')) {
            tips.push({
                message: 'Центелла может снизить раздражение от кислот',
            });
        }
    }
    if (components.includes('benzoyl_peroxide')) {
        tips.push({
            message: 'Бензоил пероксид может вызывать сухость, используйте увлажняющие средства',
        });
    }
    if (components.includes('peptides') && components.some(c => ['aha', 'bha', 'vitamin_c'].includes(c))) {
        tips.push({
            message: 'Пептиды лучше наносить на нейтральный pH, отделяйте их от кислот и витамина C',
        });
    }
    if (components.includes('vitamin_c') && components.includes('retinol')) {
        tips.push({
            message: 'Витамин C и ретинол лучше использовать в разное время суток (C утром, ретинол вечером)',
        });
    }

    const orderWarnings = warnings.filter(w => w.type === 'order');

    return {
        valid: critical_conflicts.length === 0 && orderWarnings.length === 0,
        warnings,
        critical_conflicts,
        tips,
    };
}

module.exports = {
    validateRoutine,
};