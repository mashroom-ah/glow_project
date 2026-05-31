export const formatDateApi = (date) => {
  return date
    .toISOString()
    .split('T')[0]
}

export const formatDateCard = (date) => {
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]

  return {
    day: date.getDate(),
    month: months[date.getMonth()],
  }
}