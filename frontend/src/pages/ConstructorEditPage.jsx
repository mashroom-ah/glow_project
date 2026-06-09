import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { getProductGroups, getProductsByGroup, getRoutines, createRoutine, updateRoutine, validateRoutine } from '../api/routineApi'
import '../styles/constructor-edit.css'

const productNameRu = {
  'Foam Cleanser': 'Пенка для умывания',
  'Gel Cleanser': 'Гель для умывания',
  'Moisturizing Cream': 'Увлажняющий крем',
  'Hydrating Toner': 'Увлажняющий тонер',
  'Barrier Serum': 'Восстанавливающая сыворотка',
  'Acid Toner': 'Кислотный тонер',
  'BHA Pads': 'BHA-пэды',
  'Retinol Serum': 'Сыворотка с ретинолом',
  'Azelaic Acid Serum': 'Сыворотка с азелаиновой кислотой',
  'Calming Mask': 'Успокаивающая маска',
  'Recovery Cream': 'Восстанавливающий крем',
  'Basic SPF Cream': 'Базовый SPF-крем',
  'Basic Cleanser': 'Базовый очищающий гель'
}

const groupNameRu = {
  cleansing: 'Очищение',
  hydration: 'Увлажнение',
  peeling: 'Отшелушивание',
  anti_acne: 'Против акне',
  calming: 'Успокаивание'
}

const routineTypeRu = {
  morning: 'Утренняя',
  evening: 'Вечерняя',
  universal: 'Универсальная'
}

const frequencyOptions = [
  { value: 'daily', label: 'Каждый день' },
  { value: 'weekly', label: 'Раз в неделю' },
  { value: 'every_n_days', label: 'Каждые N дней' }
]

const productColors = ['#FCE68F', '#F3BCBE', '#CDBCDB', '#D6DC82', '#FFAB86', '#C2CEDF', '#7881BB']
const ItemTypes = { PRODUCT: 'product' }

const DraggableProduct = ({ product, color }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: { product },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }))
  const productNameRuText = productNameRu[product.product_name] || product.product_name
  return (
    <div ref={drag} className="product-card" style={{ backgroundColor: color, opacity: isDragging ? 0.5 : 1 }}>
      <div className="product-name">{productNameRuText}</div>
    </div>
  )
}

const StepItem = ({ step, index, totalSteps, onDrop, onRemove, onMoveUp, onMoveDown, onUpdateFrequency, bgColor }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PRODUCT,
    drop: (item) => onDrop(item.product, index),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }))
  const productNameRuText = productNameRu[step.product_name] || step.product_name
  const groupNameRuText = groupNameRu[step.product_group] || step.product_group
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
          <div className="step-product-name">{productNameRuText}</div>
          <div className="step-product-group">{groupNameRuText}</div>
        </div>
        <div className="step-frequency">
          <select value={step.frequency_type} onChange={(e) => onUpdateFrequency(index, 'frequency_type', e.target.value)}>
            {frequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {step.frequency_type === 'every_n_days' && (
            <input type="number" min="1" value={step.frequency_value} onChange={(e) => onUpdateFrequency(index, 'frequency_value', parseInt(e.target.value) || 0)} />
          )}
        </div>
      </div>
    </div>
  )
}

const AddStepZone = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PRODUCT,
    drop: (item) => onDrop(item.product),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }))
  return (
    <div ref={drop} className={`add-step-zone ${isOver ? 'drop-over' : ''}`}>
      <button className="add-step-btn">+</button>
    </div>
  )
}

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
  const [products, setProducts] = useState([])
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductGroups().then(setGroups).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      getProductsByGroup(selectedGroupId).then(setProducts).catch(console.error)
    } else {
      setProducts([])
    }
  }, [selectedGroupId])

  const loadRoutine = async () => {
    if (existingRoutine) {
      const loadedSteps = existingRoutine.steps.map((step, idx) => ({
        id: step.routine_step_id,
        product_id: step.product.product_id,
        product_name: step.product.product_name,
        product_group: step.product.group_name,
        step_order: idx + 1,
        frequency_type: step.frequency_type,
        frequency_value: step.frequency_value,
        component_id: step.product.component_id || null,
        component_name: step.product.component_name || null
      }))
      setSteps(loadedSteps)
      setLoading(false)
    } else if (id && !existingRoutine) {
      try {
        const routines = await getRoutines()
        const found = routines.find(r => r.routine_id === id)
        if (found) {
          setRoutineType(found.routine_type)
          const loadedSteps = found.steps.map((step, idx) => ({
            id: step.routine_step_id,
            product_id: step.product.product_id,
            product_name: step.product.product_name,
            product_group: step.product.group_name,
            step_order: idx + 1,
            frequency_type: step.frequency_type,
            frequency_value: step.frequency_value,
            component_id: step.product.component_id || null,
            component_name: step.product.component_name || null
          }))
          setSteps(loadedSteps)
        } else {
          console.error('Рутина не найдена')
          navigate('/constructor')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutine()
  }, [id, existingRoutine])

  const handleDropOnStep = (product, targetIndex) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps]
      if (targetIndex < newSteps.length) {
        newSteps[targetIndex] = {
          ...newSteps[targetIndex],
          product_id: product.product_id,
          product_name: product.product_name,
          product_group: product.group_name,
          component_id: product.component_id || null,
          component_name: product.component_name || null
        }
      } else {
        const newStep = {
          id: Date.now(),
          product_id: product.product_id,
          product_name: product.product_name,
          product_group: product.group_name,
          step_order: prevSteps.length + 1,
          frequency_type: 'daily',
          frequency_value: 0,
          component_id: product.component_id || null,
          component_name: product.component_name || null
        }
        newSteps.push(newStep)
      }
      newSteps.forEach((step, idx) => { step.step_order = idx + 1 })
      return newSteps
    })
  }

  const addProductToSteps = (product) => {
    setSteps(prev => {
      const newStep = {
        id: Date.now(),
        product_id: product.product_id,
        product_name: product.product_name,
        product_group: product.group_name,
        step_order: prev.length + 1,
        frequency_type: 'daily',
        frequency_value: 0,
        component_id: product.component_id || null,
        component_name: product.component_name || null
      }
      return [...prev, newStep]
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
      if (result.tips?.length) {
        msg += '\n\nСоветы:\n' + result.tips.map(t => t.message).join('\n')
      }
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
                {products.map((product, idx) => (
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
                onDrop={handleDropOnStep}
                onRemove={removeStep}
                onMoveUp={moveStep}
                onMoveDown={moveStep}
                onUpdateFrequency={updateFrequency}
                bgColor={productColors[idx % productColors.length]}
              />
            ))}
          </div>

          <AddStepZone onDrop={addProductToSteps} />

          <div className="action-buttons">
            <button className="cancel-btn" onClick={handleCancel}>Отменить</button>
            <button className="save-btn" onClick={handleSave}>Сохранить</button>
            <button className="validate-btn" onClick={handleValidate}>Проверить</button>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}