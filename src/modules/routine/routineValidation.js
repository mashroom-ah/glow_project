const GROUP_ORDER = {
    cleansing: 1,
    peeling: 2,
    anti_acne: 3,
    hydration: 4,
    calming: 5,
};

const RUSSIAN = {
    cleansing: "очищение",
    peeling: "отшелушивание",
    anti_acne: "борьба с акне",
    hydration: "увлажнение",
    calming: "успокаивание",
}

const COMPONENT_CONFLICTS = [
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
];

function validateRoutine(products) {
    const warnings = [];

    const critical_conflicts = [];

    const tips = [];

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

    // компоненты
    const components = products
        .map((p) => p.component_name).filter(Boolean);

    for (const conflict of COMPONENT_CONFLICTS) {
        const hasAll =
            conflict.components.every((c) =>
                components.includes(c)
            );
        if (hasAll) {
            if (conflict.severity === 'critical') {
                critical_conflicts.push({
                    type: 'components',

                    components: conflict.components,

                    message: conflict.message,
                });
            } else {
                warnings.push({
                    type: 'components',

                    components: conflict.components,

                    message: conflict.message,
                });
            }
        }
    }

    // советы

    if (components.includes('retinol')) {
        tips.push({
            message:
                'Используйте SPF защиту по утрам, когда используете ретинол',
        });
    }

    if (
        components.includes('aha') ||
        components.includes('bha')
    ) {
        if (
            !components.includes('panthenol')
        ) {
            tips.push({
                message:
                    'Пантенол может снизить раздражение от ксилот',
            });
        }

        if (
            !components.includes(
                'centella_asiatica'
            )
        ) {
            tips.push({
                message:
                    'Центелла может снизить раздражение от кислот',
            });
        }
    }

    const orderWarnings = warnings.filter(
        (w) => w.type === 'order'
    );

    return {
        valid:
            critical_conflicts.length === 0 && orderWarnings.length === 0,

        warnings,

        critical_conflicts,

        tips,
    };
}

module.exports = {
    validateRoutine,
};