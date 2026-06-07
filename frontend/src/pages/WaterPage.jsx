import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayWater, addWater, removeWater } from '../api/waterApi';
import '../styles/water.css';

export default function WaterPage() {
  const navigate = useNavigate();
  const [waterData, setWaterData] = useState({
    achieved_amount: 0,
    target_amount: 2000,
    percentage: 0,
    remaining: 2000
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  // Состояния для модального окна
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add' или 'remove'
  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWaterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodayWater();
      const achieved = data.achieved_amount || 0;
      const target = data.target_amount || 2000;
      const percentage = Math.min(100, Math.round((achieved / target) * 100)) || 0;
      const remaining = Math.max(0, target - achieved);
      
      setWaterData({
        achieved_amount: achieved,
        target_amount: target,
        percentage: percentage,
        remaining: remaining
      });
    } catch (error) {
      console.error('Ошибка загрузки данных воды:', error);
      setError('Не удалось загрузить данные. Возможно, cron-задача ещё не создала запись на сегодня.');
      
      setWaterData(prev => ({
        ...prev,
        achieved_amount: 0,
        percentage: 0,
        remaining: prev.target_amount
      }));
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    const maxAdd = waterData.target_amount - waterData.achieved_amount;
    setModalType('add');
    setAmountInput('');
    setModalOpen(true);
  };

  const openRemoveModal = () => {
    setModalType('remove');
    setAmountInput('');
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    const amount = parseInt(amountInput, 10);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректное количество (больше 0)');
      return;
    }

    if (modalType === 'add') {
      const maxAdd = waterData.target_amount - waterData.achieved_amount;
      if (amount > maxAdd) {
        setError(`Нельзя добавить больше ${maxAdd} мл (дневная норма)`);
        return;
      }
    } else if (modalType === 'remove') {
      if (amount > waterData.achieved_amount) {
        setError(`Нельзя убрать больше ${waterData.achieved_amount} мл (выпито только ${waterData.achieved_amount} мл)`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      let result;
      if (modalType === 'add') {
        result = await addWater(amount);
      } else {
        result = await removeWater(amount);
      }
      
      setWaterData(prev => {
        const newAchieved = result.achieved_amount;
        const newPercentage = Math.min(100, Math.round((newAchieved / prev.target_amount) * 100));
        const newRemaining = Math.max(0, prev.target_amount - newAchieved);
        return {
          ...prev,
          achieved_amount: newAchieved,
          percentage: newPercentage,
          remaining: newRemaining
        };
      });
      
      setModalOpen(false);
      setAmountInput('');
    } catch (error) {
      console.error(`Ошибка ${modalType === 'add' ? 'добавления' : 'удаления'} воды:`, error);
      setError(error?.response?.data?.message || `Ошибка ${modalType === 'add' ? 'добавления' : 'удаления'} воды`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadWaterData();
  }, []);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (waterData.percentage / 100) * circumference;
  const maxAdd = waterData.target_amount - waterData.achieved_amount;

  if (loading) {
    return (
      <div className="water-page">
        <div className="water-container">
          <div className="water-banner">
            <h2 className="water-banner-title">Вода сегодня</h2>
          </div>
          <div className="water-loading">
            Загрузка...
          </div>
          <nav className="bottom-nav">
            <button className="nav-item" onClick={() => navigate('/constructor')}>
              <img src="/icons/constructor.svg" alt="constructor" />
            </button>
            <button className="nav-item active-nav">
              <img src="/icons/water.svg" alt="water" />
            </button>
            <button className="nav-item" onClick={() => navigate('/main')}>
              <img src="/icons/home.svg" alt="home" />
            </button>
            <button className="nav-item" onClick={() => navigate('/analytics')}>
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
    <div className="water-page">
      <div className="water-container">
        <div className="water-banner">
          <h2 className="water-banner-title">Вода сегодня</h2>
        </div>

        {error && (
          <div className="water-error">
            {error}
          </div>
        )}

        <div className="water-chart-container">
          <div className="progress-ring-container">
            <svg
              className="progress-ring"
              width="280"
              height="280"
              viewBox="0 0 280 280"
            >
              <circle
                className="progress-ring-bg"
                stroke="#C2CEDF"
                strokeWidth="16"
                fill="transparent"
                r={radius}
                cx="140"
                cy="140"
              />
              <circle
                className="progress-ring-fill"
                stroke="#7881BB"
                strokeWidth="16"
                fill="transparent"
                r={radius}
                cx="140"
                cy="140"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 140 140)"
              />
            </svg>
            
            <div className="progress-ring-center">
              <div className="percentage-text">{waterData.percentage}%</div>
              <div className="ml-text">
                {waterData.achieved_amount} / {waterData.target_amount} мл
              </div>
            </div>
          </div>
        </div>

        <div className="water-remaining">
          Осталось: {waterData.remaining} мл
        </div>

        <div className="water-buttons">
          <button 
            className="water-btn water-btn-remove"
            onClick={openRemoveModal}
            disabled={isUpdating || waterData.achieved_amount === 0}
          >
            Убрать
          </button>
          <button 
            className="water-btn water-btn-add"
            onClick={openAddModal}
            disabled={isUpdating || waterData.achieved_amount >= waterData.target_amount}
          >
            Добавить
          </button>
        </div>

        <nav className="bottom-nav">
          <button
            className="nav-item"
            onClick={() => navigate('/constructor')}
          >
            <img src="/icons/constructor.svg" alt="constructor" />
          </button>

          <button className="nav-item active-nav">
            <img src="/icons/water.svg" alt="water" />
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/main')}
          >
            <img src="/icons/home.svg" alt="home" />
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/analytics')}
          >
            <img src="/icons/chart.svg" alt="chart" />
          </button>

          <button 
            className="nav-item"
            onClick={() => navigate('/profile')}
          >
            <img src="/icons/profile.svg" alt="profile" />
          </button>
        </nav>
      </div>

      {/* Модальное окно */}
      {modalOpen && (
        <div className="water-modal-overlay" onClick={() => !isSubmitting && setModalOpen(false)}>
          <div className="water-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="water-modal-title">
              {modalType === 'add' ? 'Добавить воду' : 'Убрать воду'}
            </h3>
            
            <div className="water-modal-input-group">
              <label className="water-modal-label">
                Количество (мл)
              </label>
              <input
                type="number"
                className="water-modal-input"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Введите количество"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {modalType === 'add' && (
              <div className="water-modal-hint">
                Можно добавить до {maxAdd} мл
              </div>
            )}
            {modalType === 'remove' && (
              <div className="water-modal-hint">
                Можно убрать до {waterData.achieved_amount} мл
              </div>
            )}

            <div className="water-modal-buttons">
              <button
                className="water-modal-btn water-modal-btn-cancel"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                className="water-modal-btn water-modal-btn-submit"
                onClick={handleModalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : (modalType === 'add' ? 'Добавить' : 'Убрать')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}