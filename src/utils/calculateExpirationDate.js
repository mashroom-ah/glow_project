function addDays(date, days) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

function calculateExpirationDate(data) {
  let baseExpiration;

  if (data.expiration_date) {
    baseExpiration = new Date(data.expiration_date);
  } else {
    baseExpiration = addDays(
      data.production_date,
      data.shelf_life_closed
    );
  }

  if (
    data.opened_at &&
    data.shelf_life_open
  ) {
    const openExpiration = addDays(
      data.opened_at,
      data.shelf_life_open
    );

    return openExpiration < baseExpiration
      ? openExpiration
      : baseExpiration;
  }

  return baseExpiration;
}

module.exports = {
  calculateExpirationDate,
};