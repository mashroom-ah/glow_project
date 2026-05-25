function calculateBaseWater({
  weight,
  activity_level,
}) {
  // базово:
  // 30 мл на кг

  let amount = weight * 30;

  // активность

  if (activity_level === 'medium') {
    amount += 300;
  }

  if (activity_level === 'high') {
    amount += 600;
  }

  return Math.round(amount);
}

module.exports = {
  calculateBaseWater,
};