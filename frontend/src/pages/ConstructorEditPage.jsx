import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { getProductGroups, getProductsByGroup, getRoutines, createRoutine, updateRoutine, validateRoutine } from '../api/routineApi'
import '../styles/constructor-edit.css'

// ========== ПЕРЕВОДЫ ==========
const productNameRu = {
  'Foam Cleanser': 'Пенка для умывания',
  'Gel Cleanser': 'Гель для умывания',
  'Cream Gel Cleanser': 'Крем-гель для умывания',
  'Hydrophilic Oil': 'Гидрофильное масло',
  'Micellar Water': 'Мицелярная вода',
  'Basic Cleanser': 'Базовый очищающий гель',
  'Cream': 'Крем',
  'Serum': 'Сыворотка',
  'Essence': 'Эссенция',
  'Toner': 'Тонер',
  'Mask': 'Маска',
  'Moisturizing Cream': 'Увлажняющий крем',
  'Hydrating Toner': 'Увлажняющий тонер',
  'Barrier Serum': 'Восстанавливающая сыворотка',
  'Basic SPF Cream': 'Базовый SPF-крем',
  'Peeling Solution': 'Пилинг-раствор',
  'Pads': 'Пэды',
  'Scrub': 'Скраб',
  'Enzyme Powder': 'Энзимная пудра',
  'Acid Toner': 'Кислотный тонер',
  'BHA Pads': 'BHA-пэды',
  'Spot Treatment': 'Точечное средство',
  'Retinol Serum': 'Сыворотка',
  'Azelaic Acid Serum': 'Сыворотка',
  'Night Cream': 'Ночной крем',
  'Anti Age Serum': 'Антивозрастная сыворотка',
  'Eye Cream': 'Крем для глаз',
  'Masks': 'Маски',
  'Calming Mask': 'Успокаивающая маска',
  'Recovery Cream': 'Восстанавливающий крем'
}

const componentNameRu = {
  niacinamide: 'Ниацинамид',
  aha: 'AHA-кислоты',
  bha: 'BHA-кислоты',
  pha: 'PHA-кислоты',
  azelaic_acid: 'Азелаиновая кислота',
  zinc: 'Цинк',
  vitamin_c: 'Витамин C',
  retinol: 'Ретинол',
  hyaluronic_acid: 'Гиалуроновая кислота',
  ceramides: 'Церамиды',
  panthenol: 'Пантенол',
  snail_mucin: 'Экстракт улитки',
  centella_asiatica: 'Центелла азиатская',
  squalane: 'Сквалан',
  oils: 'Масла',
  aloe_vera: 'Алоэ вера',
  urea: 'Мочевина',
  glycolic_acid: 'Гликолевая кислота',
  lactic_acid: 'Молочная кислота',
  mandelic_acid: 'Миндальная кислота',
  salicylic_acid: 'Салициловая кислота',
  gluconolactone: 'Глюконолактон',
  lactobionic_acid: 'Лактобионовая кислота',
  scrub_particles: 'Скрабирующие частицы',
  benzoyl_peroxide: 'Бензоил пероксид',
  sulfur: 'Сера',
  retinal: 'Ретиналь',
  peptides: 'Пептиды',
  colloidal_oatmeal: 'Коллоидная овсянка'
}

const groupNameRu = {
  cleansing: 'Очищение',
  hydration: 'Увлажнение',
  peeling: 'Отшелушивание',
  anti_acne: 'Против акне',
  anti_age: 'Антивозрастной',
  calming: 'Успокаивание'
}

const frequencyOptions = [
  { value: 'daily', label: 'Каждый день' },
  { value: 'weekly', label: 'Раз в неделю' },
  { value: 'every_n_days', label: 'Каждые N дней' }
]

const productColors = ['#FCE68F', '#F3BCBE', '#CDBCDB', '#D6DC82', '#FFAB86', '#C2CEDF', '#7881BB']
const ItemTypes = { PRODUCT: 'product' }

// ========== ПЕРЕТАСКИВАЕМЫЙ ПРОДУКТ ==========
const DraggableProduct = ({ product, color }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: {
      baseName: product.baseName,
      groupName: product.group_name,
      groupId: product.group_id
    },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }))
  const displayName = productNameRu[product.baseName] || product.baseName
  return (
    <div ref={drag} className="product-card" style={{ backgroundColor: color, opacity: isDragging ? 0.5 : 1 }}>
      <div className="product-name">{displayName}</div>
    </div>
  )
}

// ========== ШАГ РУТИНЫ (с двумя селектами) ==========
const StepItem = ({ step, index, totalSteps, onDrop, onRemove, onMoveUp, onMoveDown, onUpdateFrequency, onComponentChange, bgColor, availableComponents }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PRODUCT,
    drop: (item) => onDrop(item, index),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }))

  const baseName = step.baseProductName || step.product_name.split(' (')[0]
  const productDisplay = productNameRu[baseName] || baseName
  const groupDisplay = groupNameRu[step.product_group] || step.product_group

  // Текущий выбранный компонент
  const currentComponentId = step.component_id || ''
  // Список компонентов для селекта (уже загружен)
  const comps = availableComponents[step.product_group] || []

  const handleComponentSelect = (e) => {
    const compId = e.target.value === '' ? null : e.target.value
    onComponentChange(index, compId)
  }

  return (
    <div ref={drop} className={`step-item ${isOver ? 'drop-over' : ''}`}>
      <div className="step-header">
        <span className="step-number">Шаг {step.step_order}</span>
        <div>
          <button className="move-up" onClick={() => onMoveUp(index, -1)} disabled={index === 0}>↑</button>
          <button className="move-down" onClick={() => onMoveDown(index, 1)} disabled={index === totalSteps - 1}>↓</button>
          <button className="remove-step" onClick={() => onRemove(index)}>✕</button>
        </div>
      </div>
      <div className="step-content">
        <div className="step-product-card" style={{ backgroundColor: bgColor }}>
          <div className="step-product-name">{productDisplay}</div>
          <div className="step-product-group">{groupDisplay}</div>
        </div>
        <div className="step-freq-comp">
          <div className="step-frequency">
            <select value={step.frequency_type} onChange={(e) => onUpdateFrequency(index, 'frequency_type', e.target.value)}>
              {frequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {step.frequency_type === 'every_n_days' && (
              <input type="number" min="1" value={step.frequency_value} onChange={(e) => onUpdateFrequency(index, 'frequency_value', parseInt(e.target.value) || 0)} />
            )}
          </div>
          <div className="step-component-select">
            <select value={currentComponentId} onChange={handleComponentSelect}>
              <option value="">Без компонента</option>
              {comps.map(comp => (
                <option key={comp.component_id} value={comp.component_id}>
                  {componentNameRu[comp.component_name] || comp.component_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== ЗОНА ДОБАВЛЕНИЯ ==========
const AddStepZone = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PRODUCT,
    drop: (item) => onDrop(item, null),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }))
  return (
    <div ref={drop} className={`add-step-zone ${isOver ? 'drop-over' : ''}`}>
      <button className="add-step-btn">+</button>
    </div>
  )
}

// ========== МОДАЛЬНОЕ ОКНО ВЫБОРА КОМПОНЕНТА ПРИ ДОБАВЛЕНИИ ==========
const ComponentModal = ({ baseName, groupName, components, onClose, onSelect }) => {
  const [selectedComponentId, setSelectedComponentId] = useState('')
  useEffect(() => {
    if (components.length > 0) setSelectedComponentId(components[0].component_id)
  }, [components])
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>Выберите активный компонент для "{baseName}"</h3>
        <select value={selectedComponentId} onChange={e => setSelectedComponentId(e.target.value)}>
          <option value="">Без компонента</option>
          {components.map(comp => (
            <option key={comp.component_id} value={comp.component_id}>
              {componentNameRu[comp.component_name] || comp.component_name}
            </option>
          ))}
        </select>
        <div className="modal-actions">
          <button onClick={onClose}>Отмена</button>
          <button onClick={() => onSelect(selectedComponentId === '' ? null : selectedComponentId)}>Выбрать</button>
        </div>
      </div>
    </div>
  )
}

// ========== ОСНОВНОЙ КОМПОНЕНТ ==========
export default function ConstructorEditPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { id } = useParams()
  const existingRoutine = state?.routine || null
  const isEdit = !!existingRoutine || !!id
  const initialType = state?.routineType || existingRoutine?.routine_type || 'morning'

  const [routineType, setRoutineType] = useState(initialType)
  const [groups, setGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [allProductsGroup, setAllProductsGroup] = useState([]) // продукты выбранной группы
  const [allProductsGlobal, setAllProductsGlobal] = useState([]) // все продукты для поиска
  const [uniqueProducts, setUniqueProducts] = useState([])
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [availableComponents, setAvailableComponents] = useState({}) // groupName -> comps[]
  const [fetchingComponents, setFetchingComponents] = useState({})

  // Загрузка всех продуктов (глобально)
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setAllProductsGlobal(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    getProductGroups().then(setGroups).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      getProductsByGroup(selectedGroupId).then(products => {
        setAllProductsGroup(products)
        const map = new Map()
        for (const p of products) {
          let baseName = p.product_name
          const parenIndex = baseName.indexOf(' (')
          if (parenIndex !== -1) baseName = baseName.substring(0, parenIndex)
          if (!map.has(baseName)) {
            map.set(baseName, {
              product_id: p.product_id,
              baseName: baseName,
              group_id: p.group_id,
              group_name: p.group_name
            })
          }
        }
        setUniqueProducts(Array.from(map.values()))
      }).catch(console.error)
    } else {
      setAllProductsGroup([])
      setUniqueProducts([])
    }
  }, [selectedGroupId])

  // Загрузка компонентов для группы
  const fetchComponentsForGroup = async (groupName) => {
    if (availableComponents[groupName] || fetchingComponents[groupName]) return
    setFetchingComponents(prev => ({ ...prev, [groupName]: true }))
    try {
      const res = await fetch(`/api/group-components/by-group?group_name=${groupName}`)
      const data = await res.json()
      setAvailableComponents(prev => ({ ...prev, [groupName]: data }))
    } catch (err) {
      console.error(err)
    } finally {
      setFetchingComponents(prev => ({ ...prev, [groupName]: false }))
    }
  }

  // Подгрузка компонентов для всех групп, встречающихся в шагах
  useEffect(() => {
    steps.forEach(step => {
      if (step.product_group) fetchComponentsForGroup(step.product_group)
    })
  }, [steps])

  const loadRoutine = async () => {
    if (existingRoutine) {
      const loadedSteps = existingRoutine.steps.map((step, idx) => {
        let baseName = step.product.product_name
        const parenIndex = baseName.indexOf(' (')
        if (parenIndex !== -1) baseName = baseName.substring(0, parenIndex)
        return {
          id: step.routine_step_id,
          product_id: step.product.product_id,
          product_name: step.product.product_name,
          product_group: step.product.group_name,
          baseProductName: baseName,
          step_order: idx + 1,
          frequency_type: step.frequency_type,
          frequency_value: step.frequency_value,
          component_id: step.product.component_id || null,
          component_name: step.product.component_name || null
        }
      })
      setSteps(loadedSteps)
      setLoading(false)
    } else if (id && !existingRoutine) {
      try {
        const routines = await getRoutines()
        const found = routines.find(r => r.routine_id === id)
        if (found) {
          setRoutineType(found.routine_type)
          const loadedSteps = found.steps.map((step, idx) => {
            let baseName = step.product.product_name
            const parenIndex = baseName.indexOf(' (')
            if (parenIndex !== -1) baseName = baseName.substring(0, parenIndex)
            return {
              id: step.routine_step_id,
              product_id: step.product.product_id,
              product_name: step.product.product_name,
              product_group: step.product.group_name,
              baseProductName: baseName,
              step_order: idx + 1,
              frequency_type: step.frequency_type,
              frequency_value: step.frequency_value,
              component_id: step.product.component_id || null,
              component_name: step.product.component_name || null
            }
          })
          setSteps(loadedSteps)
        } else navigate('/constructor')
      } catch (err) { console.error(err) } finally { setLoading(false) }
    } else setLoading(false)
  }

  useEffect(() => { loadRoutine() }, [id, existingRoutine])

  // Поиск продукта по базовому имени, группе и component_id
  const findProduct = (baseName, groupName, componentId) => {
    return allProductsGlobal.find(p => {
      const pBase = p.product_name.split(' (')[0]
      return pBase === baseName && p.group_name === groupName && (p.component_id === componentId || (componentId === null && p.component_id === null))
    })
  }

  // Обработка перетаскивания продукта
  const handleProductDrop = (dragItem, targetIndex) => {
    if (!dragItem) return
    const { baseName, groupName } = dragItem
    if (!availableComponents[groupName]) {
      fetchComponentsForGroup(groupName).then(() => {
        setPendingProduct({ baseName, groupName, targetIndex })
        setModalOpen(true)
      })
    } else {
      setPendingProduct({ baseName, groupName, targetIndex })
      setModalOpen(true)
    }
  }

  const handleComponentSelectModal = (componentId) => {
    if (!pendingProduct) return
    const { baseName, groupName, targetIndex } = pendingProduct
    const product = findProduct(baseName, groupName, componentId)
    if (!product) {
      alert('Продукт с таким компонентом не найден. Проверьте данные в БД.')
      setModalOpen(false)
      setPendingProduct(null)
      return
    }
    setSteps(prev => {
      const newSteps = [...prev]
      const newStep = {
        id: Date.now(),
        product_id: product.product_id,
        product_name: product.product_name,
        product_group: product.group_name,
        baseProductName: baseName,
        step_order: (targetIndex === null || targetIndex >= newSteps.length) ? newSteps.length + 1 : targetIndex + 1,
        frequency_type: 'daily',
        frequency_value: 0,
        component_id: product.component_id,
        component_name: product.component_name
      }
      if (targetIndex !== null && targetIndex < newSteps.length) {
        newSteps[targetIndex] = newStep
      } else {
        newSteps.push(newStep)
      }
      newSteps.forEach((s, idx) => s.step_order = idx + 1)
      return newSteps
    })
    setModalOpen(false)
    setPendingProduct(null)
  }

  // Смена компонента у существующего шага
  const handleComponentChange = (stepIndex, componentId) => {
    const step = steps[stepIndex]
    const { baseProductName, product_group } = step
    const newProduct = findProduct(baseProductName, product_group, componentId)
    if (!newProduct) {
      alert(`Не удалось найти продукт "${baseProductName}" с компонентом ${componentId} в группе ${product_group}`)
      return
    }
    setSteps(prev => {
      const newSteps = [...prev]
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        product_id: newProduct.product_id,
        product_name: newProduct.product_name,
        component_id: newProduct.component_id,
        component_name: newProduct.component_name
      }
      return newSteps
    })
  }

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index)
    newSteps.forEach((step, idx) => { step.step_order = idx + 1 })
    setSteps(newSteps)
  }

  const moveStep = (index, direction) => {
    const newSteps = [...steps]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= steps.length) return
    ;[newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]]
    newSteps.forEach((step, idx) => { step.step_order = idx + 1 })
    setSteps(newSteps)
  }

  const updateFrequency = (index, field, value) => {
    const newSteps = [...steps]
    newSteps[index][field] = value
    if (field === 'frequency_type' && value !== 'every_n_days') {
      newSteps[index].frequency_value = 0
    }
    setSteps(newSteps)
  }

  const handleValidate = async () => {
    const payload = steps.map(step => ({
      product_id: step.product_id,
      step_order: step.step_order,
      frequency_type: step.frequency_type,
      frequency_value: step.frequency_value
    }))
    try {
      const result = await validateRoutine(payload)
      let msg = ''
      if (result.critical_conflicts?.length) {
        msg = 'Критические ошибки:\n' + result.critical_conflicts.map(c => c.message).join('\n')
      } else if (result.warnings?.length) {
        msg = 'Предупреждения:\n' + result.warnings.map(w => w.message).join('\n')
      } else {
        msg = 'Рутина валидна!'
      }
      if (result.tips?.length) msg += '\n\nСоветы:\n' + result.tips.map(t => t.message).join('\n')
      alert(msg)
    } catch (err) {
      alert('Ошибка проверки: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleSave = async () => {
    if (steps.length === 0) {
      alert('Добавьте хотя бы один шаг')
      return
    }
    const payload = steps.map(step => ({
      product_id: step.product_id,
      step_order: step.step_order,
      frequency_type: step.frequency_type,
      frequency_value: step.frequency_value
    }))
    try {
      if (isEdit) {
        await updateRoutine(id || existingRoutine.routine_id, routineType, payload)
      } else {
        await createRoutine(routineType, payload)
      }
      navigate('/constructor')
    } catch (err) {
      alert('Ошибка сохранения: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleCancel = () => navigate('/constructor')

  if (loading) {
    return <div className="constructor-edit-page"><div className="constructor-edit-container">Загрузка...</div></div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="constructor-edit-page">
        <div className="constructor-edit-container">
          <div className="edit-header">
            <div className="group-selector">
              <label>Группа средств</label>
              <select value={selectedGroupId || ''} onChange={(e) => setSelectedGroupId(e.target.value)}>
                <option value="">Выберите группу</option>
                {groups.map(group => (
                  <option key={group.group_id} value={group.group_id}>
                    {groupNameRu[group.group_name] || group.group_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="routine-type-selector">
              <label>Тип рутины</label>
              <select value={routineType} onChange={(e) => setRoutineType(e.target.value)}>
                <option value="morning">Утренняя</option>
                <option value="evening">Вечерняя</option>
                <option value="universal">Универсальная</option>
              </select>
            </div>
          </div>

          {selectedGroupId && (
            <div className="products-carousel">
              <div className="products-scroll">
                {uniqueProducts.map((product, idx) => (
                  <DraggableProduct key={product.product_id} product={product} color={productColors[idx % productColors.length]} />
                ))}
              </div>
            </div>
          )}

          <div className="steps-list">
            {steps.map((step, idx) => (
              <StepItem
                key={step.id}
                step={step}
                index={idx}
                totalSteps={steps.length}
                onDrop={handleProductDrop}
                onRemove={removeStep}
                onMoveUp={moveStep}
                onMoveDown={moveStep}
                onUpdateFrequency={updateFrequency}
                onComponentChange={handleComponentChange}
                bgColor={productColors[idx % productColors.length]}
                availableComponents={availableComponents}
              />
            ))}
          </div>

          <AddStepZone onDrop={handleProductDrop} />

          <div className="action-buttons">
            <button className="cancel-btn" onClick={handleCancel}>Отменить</button>
            <button className="save-btn" onClick={handleSave}>Сохранить</button>
            <button className="validate-btn" onClick={handleValidate}>Проверить</button>
          </div>
        </div>
      </div>
      {modalOpen && pendingProduct && availableComponents[pendingProduct.groupName] && (
        <ComponentModal
          baseName={pendingProduct.baseName}
          groupName={pendingProduct.groupName}
          components={availableComponents[pendingProduct.groupName]}
          onClose={() => { setModalOpen(false); setPendingProduct(null) }}
          onSelect={handleComponentSelectModal}
        />
      )}
    </DndProvider>
  )
}