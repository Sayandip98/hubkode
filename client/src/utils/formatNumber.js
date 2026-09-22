const formatNumber = (number) => {
  if (number === null || number === undefined) return "0";

  const num = Number(number);

  if (isNaN(num)) return "0";

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }

  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return num.toLocaleString();
};

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatPercent = (value, total, decimals = 1) => {
  if (!total || total === 0) return "0%";

  const percent = (value / total) * 100;
  return `${percent.toFixed(decimals).replace(/\.0$/, "")}%`;
};

const formatStat = (number) => {
  if (number === null || number === undefined) return "0";

  const num = Number(number);
  if (isNaN(num)) return "0";

  return num.toLocaleString();
};

const formatLines = (additions, deletions) => {
  const parts = [];

  if (additions > 0) parts.push(`+${formatNumber(additions)}`);
  if (deletions > 0) parts.push(`-${formatNumber(deletions)}`);

  return parts.join(" ");
};

export { formatNumber, formatBytes, formatPercent, formatStat, formatLines };
