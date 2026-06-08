import { useEffect, useRef, useState } from 'react';
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

const COLORS = {
  primary: '#7881BB',
  secondary: '#C2CEDF',
  accent1: '#FCE68F',
  accent2: '#F3BCBE',
  accent3: '#CDBCDB',
  accent4: '#D6DC82',
  accent5: '#FFAB86',
};

const REACTION_BAR_COLORS = [
  COLORS.primary,
  COLORS.accent2,
  COLORS.accent1,
  COLORS.accent3,
  COLORS.accent4,
  COLORS.accent5
];

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

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState('week');
  const [endDate, setEndDate] = useState(new Date());

  const [waterType, setWaterType] = useState('percent');

  const [waterData, setWaterData] = useState(null);
  const [routineData, setRoutineData] = useState(null);
  const [skinData, setSkinData] = useState(null);
  const [reactionGroupsData, setReactionGroupsData] = useState(null);
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

  const formatDisplayDate = (date) => {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const openCalendar = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    }
  };

  const handleDateChange = (e) => {
    const rawDate = e.target.value;
    if (!rawDate) return;
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      setEndDate(parsedDate);
    }
  };

  const CustomTooltip = ({ active, payload, label, unit = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="analytics-tooltip">
          <p className="tooltip-date">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} className="tooltip-value" style={{ color: item.color }}>
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
        <div className="analytics-controls">
          <div className="control-group">
            <label>Период</label>
            <div className="period-buttons">
              <button className={`period-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>
                Неделя
              </button>
              <button className={`period-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>
                Месяц
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>Дата окончания</label>
            <div className="date-picker-wrapper">
              <button className="date-btn" onClick={openCalendar}>
                {formatDisplayDate(endDate)}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                className="hidden-date-input"
                value={formatDateApi(endDate)}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>

        {error && <div className="analytics-error">{error}</div>}

        {/* Вода */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Потребление воды</h3>
            <div className="water-type-buttons">
              <button className={`type-btn ${waterType === 'percent' ? 'active' : ''}`} onClick={() => setWaterType('percent')}>
                Проценты
              </button>
              <button className={`type-btn ${waterType === 'ml' ? 'active' : ''}`} onClick={() => setWaterType('ml')}>
                Миллилитры
              </button>
            </div>
          </div>
          {waterData && waterData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {waterType === 'percent' ? (
                <LineChart data={waterData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tickFormatter={(d) => `${new Date(d).getDate()}/${new Date(d).getMonth() + 1}`} />
                  <YAxis domain={[0, 150]} unit="%" />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Выпито от нормы" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <LineChart data={waterData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tickFormatter={(d) => `${new Date(d).getDate()}/${new Date(d).getMonth() + 1}`} />
                  <YAxis unit=" мл" />
                  <Tooltip content={<CustomTooltip unit=" мл" />} />
                  <Legend />
                  <Line type="monotone" dataKey="achieved_amount" name="Выпито" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target_amount" name="Норма" stroke={COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

        {/* Выполнение рутины */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Выполнение рутины</h3>
            <div className="routine-type-buttons">
              <button className={`type-btn ${selectedRoutineType === 'morning' ? 'active' : ''}`} onClick={() => setSelectedRoutineType('morning')}>
                Утро
              </button>
              <button className={`type-btn ${selectedRoutineType === 'evening' ? 'active' : ''}`} onClick={() => setSelectedRoutineType('evening')}>
                Вечер
              </button>
              <button className={`type-btn ${selectedRoutineType === 'universal' ? 'active' : ''}`} onClick={() => setSelectedRoutineType('universal')}>
                Универсальная
              </button>
            </div>
          </div>
          {routineData && routineData[selectedRoutineType]?.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={routineData[selectedRoutineType].data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tickFormatter={(d) => `${new Date(d).getDate()}/${new Date(d).getMonth() + 1}`} />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Legend />
                <Line type="monotone" dataKey="completion_percent" name="Выполнение" stroke={COLORS.accent1} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

        {/* Состояние кожи */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Состояние кожи</h3>
          </div>
          {skinData && skinData.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={skinData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tickFormatter={(d) => `${new Date(d).getDate()}/${new Date(d).getMonth() + 1}`} />
                <YAxis domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="score" name="Оценка кожи" stroke={COLORS.accent3} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

        {/* Реакции кожи - столбчатая диаграмма */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Реакции кожи</h3>
          </div>
          {reactionGroupsData && reactionGroupsData.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart layout="vertical" data={reactionGroupsData.data} margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis type="category" dataKey="reaction_group_name" tickFormatter={(val) => reactionGroupRu[val] || val} width={100} />
                <Tooltip formatter={(value) => [`${value}/10`, 'Средняя оценка']} labelFormatter={(label) => reactionGroupRu[label] || label} />
                <Legend />
                <Bar dataKey="average_score" name="Средняя оценка" barSize={40} radius={[0, 8, 8, 0]}>
                  {reactionGroupsData.data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={REACTION_BAR_COLORS[idx % REACTION_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Недостаточно данных для отображения графика</div>
          )}
        </div>

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