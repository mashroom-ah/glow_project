import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  getWaterAnalytics,
  getRoutineAnalytics,
  getSkinAnalytics,
  getReactionGroupsAnalytics
} from '../api/analyticsApi';
import { formatDateApi } from '../utils/date';
import '../styles/analytics.css';

// Константы для цветов
const COLORS = {
  primary: '#7881BB',
  secondary: '#C2CEDF',
  accent1: '#FCE68F',
  accent2: '#F3BCBE',
  accent3: '#CDBCDB',
  accent4: '#D6DC82',
  accent5: '#FFAB86',
  text: '#000000',
  background: '#F0E5D4'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.accent2,
  COLORS.accent1,
  COLORS.accent3,
  COLORS.accent4,
  COLORS.accent5,
  COLORS.secondary
];

// Переводы
const routineTypeRu = {
  morning: 'Утренняя рутина',
  evening: 'Вечерняя рутина',
  universal: 'Универсальная рутина'
};

const reactionGroupRu = {
  hydration: 'Увлажнение',
  irritation: 'Раздражение',
  acne: 'Акне',
  sensitivity: 'Чувствительность',
  texture: 'Текстура'
};

const periodRu = {
  week: 'Неделя',
  month: 'Месяц'
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  
  // Состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Параметры
  const [period, setPeriod] = useState('week');
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Тип для воды
  const [waterType, setWaterType] = useState('percent');
  
  // Данные
  const [waterData, setWaterData] = useState(null);
  const [routineData, setRoutineData] = useState(null);
  const [skinData, setSkinData] = useState(null);
  const [reactionGroupsData, setReactionGroupsData] = useState(null);
  
  // Выбранная рутина для отображения
  const [selectedRoutineType, setSelectedRoutineType] = useState('morning');

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    const formattedEndDate = formatDateApi(endDate);
    
    try {
      const [water, routineMorning, routineEvening, routineUniversal, skin, reactionGroups] = await Promise.all([
        getWaterAnalytics(waterType, period, formattedEndDate),
        getRoutineAnalytics('morning', period, formattedEndDate),
        getRoutineAnalytics('evening', period, formattedEndDate),
        getRoutineAnalytics('universal', period, formattedEndDate),
        getSkinAnalytics(period, formattedEndDate),
        getReactionGroupsAnalytics(period, formattedEndDate)
      ]);
      
      setWaterData(water);
      setRoutineData({
        morning: routineMorning,
        evening: routineEvening,
        universal: routineUniversal
      });
      setSkinData(skin);
      setReactionGroupsData(reactionGroups);
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err);
      setError('Не удалось загрузить данные аналитики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [period, endDate, waterType]);

  // Форматирование даты для отображения
  const formatDisplayDate = (date) => {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Кастомный Tooltip
  const CustomTooltip = ({ active, payload, label, unit = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="analytics-tooltip">
          <p className="tooltip-date">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="tooltip-value" style={{ color: item.color }}>
              {item.name}: {item.value}{unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-container">
          <div className="analytics-loading">Загрузка аналитики...</div>
          <nav className="bottom-nav">
            <button className="nav-item" onClick={() => navigate('/constructor')}>
              <img src="/icons/constructor.svg" alt="constructor" />
            </button>
            <button className="nav-item" onClick={() => navigate('/water')}>
              <img src="/icons/water.svg" alt="water" />
            </button>
            <button className="nav-item" onClick={() => navigate('/main')}>
              <img src="/icons/home.svg" alt="home" />
            </button>
            <button className="nav-item active-nav">
              <img src="/icons/chart.svg" alt="chart" />
            </button>
            <button className="nav-item" onClick={() => navigate('/profile')}>
              <img src="/icons/profile.svg" alt="profile" />
            </button>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* Управление параметрами */}
        <div className="analytics-controls">
          <div className="control-group">
            <label>Период</label>
            <div className="period-buttons">
              <button
                className={`period-btn ${period === 'week' ? 'active' : ''}`}
                onClick={() => setPeriod('week')}
              >
                Неделя
              </button>
              <button
                className={`period-btn ${period === 'month' ? 'active' : ''}`}
                onClick={() => setPeriod('month')}
              >
                Месяц
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <label>Дата окончания</label>
            <div className="date-picker-wrapper">
              <button
                className="date-btn"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {formatDisplayDate(endDate)}
              </button>
              {showDatePicker && (
                <input
                  type="date"
                  className="date-input-popup"
                  value={formatDateApi(endDate)}
                  onChange={(e) => {
                    setEndDate(new Date(e.target.value));
                    setShowDatePicker(false);
                  }}
                  onBlur={() => setShowDatePicker(false)}
                  autoFocus
                />
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="analytics-error">{error}</div>
        )}

        {/* График воды */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Потребление воды</h3>
            <div className="water-type-buttons">
              <button
                className={`type-btn ${waterType === 'percent' ? 'active' : ''}`}
                onClick={() => setWaterType('percent')}
              >
                Проценты
              </button>
              <button
                className={`type-btn ${waterType === 'ml' ? 'active' : ''}`}
                onClick={() => setWaterType('ml')}
              >
                Миллилитры
              </button>
            </div>
          </div>
          
          {waterData && waterData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {waterType === 'percent' ? (
                <LineChart data={waterData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis domain={[0, 150]} unit="%" />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Выпито от нормы"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <LineChart data={waterData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis unit=" мл" />
                  <Tooltip content={<CustomTooltip unit=" мл" />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="achieved_amount"
                    name="Выпито"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target_amount"
                    name="Норма"
                    stroke={COLORS.secondary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: COLORS.secondary, r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

        {/* График выполнения рутины */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Выполнение рутины</h3>
            <div className="routine-type-buttons">
              <button
                className={`type-btn ${selectedRoutineType === 'morning' ? 'active' : ''}`}
                onClick={() => setSelectedRoutineType('morning')}
              >
                Утро
              </button>
              <button
                className={`type-btn ${selectedRoutineType === 'evening' ? 'active' : ''}`}
                onClick={() => setSelectedRoutineType('evening')}
              >
                Вечер
              </button>
              <button
                className={`type-btn ${selectedRoutineType === 'universal' ? 'active' : ''}`}
                onClick={() => setSelectedRoutineType('universal')}
              >
                Универсальная
              </button>
            </div>
          </div>
          
          {routineData && routineData[selectedRoutineType]?.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routineData[selectedRoutineType].data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Legend />
                <Bar
                  dataKey="completion_percent"
                  name="Выполнение"
                  fill={COLORS.accent1}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

        {/* График состояния кожи */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Состояние кожи</h3>
          </div>
          
          {skinData && skinData.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={skinData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Оценка кожи"
                  stroke={COLORS.accent3}
                  strokeWidth={2}
                  dot={{ fill: COLORS.accent3, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

        {/* Реакции кожи - круговая диаграмма */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Реакции кожи</h3>
          </div>
          
          {reactionGroupsData && reactionGroupsData.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={reactionGroupsData.data}
                  dataKey="average_score"
                  nameKey="reaction_group_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${reactionGroupRu[name] || name}: ${value}`}
                  labelLine={true}
                >
                  {reactionGroupsData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}/10`, 'Средняя оценка']} />
                <Legend 
                  formatter={(value) => reactionGroupRu[value] || value}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

        {/* Нижняя навигация */}
        <nav className="bottom-nav">
          <button className="nav-item" onClick={() => navigate('/constructor')}>
            <img src="/icons/constructor.svg" alt="constructor" />
          </button>
          <button className="nav-item" onClick={() => navigate('/water')}>
            <img src="/icons/water.svg" alt="water" />
          </button>
          <button className="nav-item" onClick={() => navigate('/main')}>
            <img src="/icons/home.svg" alt="home" />
          </button>
          <button className="nav-item active-nav">
            <img src="/icons/chart.svg" alt="chart" />
          </button>
          <button className="nav-item" onClick={() => navigate('/profile')}>
            <img src="/icons/profile.svg" alt="profile" />
          </button>
        </nav>
      </div>
    </div>
  );
}