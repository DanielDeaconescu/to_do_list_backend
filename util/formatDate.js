function formatMongoDate(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "Ivalid date";

  const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    date,
  );
  const hour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
  }).format(date);

  return `${dayOfWeek}, ${day} ${month}, ${hour}`;
}

module.exports = formatMongoDate;
