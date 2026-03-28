export const formatTimeAgo = (dateValue) => {
  const date = new Date(dateValue);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "Just now";

  const ranges = [
    { label: "year", value: 31536000 },
    { label: "month", value: 2592000 },
    { label: "day", value: 86400 },
    { label: "hour", value: 3600 },
    { label: "min", value: 60 }
  ];

  for (const range of ranges) {
    const count = Math.floor(seconds / range.value);
    if (count >= 1) {
      return count + " " + range.label + (count > 1 ? "s" : "") + " ago";
    }
  }

  return seconds + " sec" + (seconds > 1 ? "s" : "") + " ago";
};
