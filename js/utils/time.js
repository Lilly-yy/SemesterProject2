export function formatTimeLeft(endsAt) {
  const end = new Date(endsAt).getTime();
  const now = Date.now();

  if (!Number.isFinite(end)) return "—";

  const diff = end - now;
  if (diff <= 0) return "Ended";

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
