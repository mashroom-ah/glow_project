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

  const loadWaterData = async () => {
    try {
      setLoading(true);
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
      // Если данные не найдены, показываем нулевые значения
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

  const handleAddWater = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const amount = 50;
      const result = await addWater(amount);
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
    } catch (error) {
      console.error('Ошибка добавления воды:', error);
      alert(error?.response?.data?.message || 'Ошибка добавления воды');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveWater = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const amount = 50;
      const result = await removeWater(amount);
      setWaterData(prev => {
        const newAchieved = result.achieved_amount;
        const newPercentage = Math.round((newAchieved / prev.target_amount) * 100);
        const newRemaining = Math.max(0, prev.target_amount - newAchieved);
        return {
          ...prev,
          achieved_amount: newAchieved,
          percentage: newPercentage,
          remaining: newRemaining
        };
      });
    } catch (error) {
      console.error('Ошибка удаления воды:', error);
      alert(error?.response?.data?.message || 'Ошибка удаления воды');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadWaterData();
  }, []);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (waterData.percentage / 100) * circumference;

  return (
    <div className="water-page">
      <div className="water-container">
        <div className="water-banner">
          <h2 className="water-banner-title">Вода сегодня</h2>
        </div>

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
            onClick={handleRemoveWater}
            disabled={isUpdating || waterData.achieved_amount === 0}
          >
            Убрать
          </button>
          <button 
            className="water-btn water-btn-add"
            onClick={handleAddWater}
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
    </div>
  );
}