function addDays(date, days) {
  const result = new Date(date);

  result.setDate(result.getDate() + Number(days));

  return result;
}

function getNearestDate(date1, date2) {
  if (!date1) {
    return date2;
  }

  if (!date2) {
    return date1;
  }

  return date1 < date2
    ? date1
    : date2;
}

function calculateExpirationDate(data, currentItem = null) {
  const productionDate =
    data.production_date ||
    currentItem?.production_date;

  const shelfLifeClosed =
    data.shelf_life_closed ??
    currentItem?.shelf_life_closed;

  const shelfLifeOpen =
    data.shelf_life_open ??
    currentItem?.shelf_life_open;

  const openedAt =
    data.opened_at ||
    currentItem?.opened_at;

  let expirationDate =
    data.expiration_date ||
    currentItem?.expiration_date;

  // если expiration_date не передали —
  // считаем от даты производства

  if (!expirationDate) {
    expirationDate = addDays(
      productionDate,
      shelfLifeClosed
    );
  }

  // если товар открыт —
  // сравниваем со сроком после открытия

  if (openedAt && shelfLifeOpen) {
    const openExpirationDate = addDays(
      openedAt,
      shelfLifeOpen
    );

    expirationDate = getNearestDate(
      new Date(expirationDate),
      openExpirationDate
    );
  }

  return expirationDate;
}

module.exports = {
  calculateExpirationDate,
};