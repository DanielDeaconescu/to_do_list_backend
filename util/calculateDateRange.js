function calculateDateRange() {
  const today = new Date();

  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  console.log("days since monday: ", daysSinceMonday);

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatIso = (date) => date.toISOString().split("T")[0];

  return {
    start: formatIso(monday),
    end: formatIso(sunday),
  };
}

module.exports = calculateDateRange;
