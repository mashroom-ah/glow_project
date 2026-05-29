function calculateItemStatus(expirationDate) {
  const today = new Date();

  const expiration = new Date(expirationDate);

  const diffTime = expiration - today;

  const diffDays = Math.ceil(
    diffTime / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return 'expired';
  }

  if (diffDays < 14) {
    return 'expiring';
  }

  if (diffDays <= 30) {
    return 'expiring_soon';
  }

  return 'valid';
}

module.exports = {
  calculateItemStatus,
};