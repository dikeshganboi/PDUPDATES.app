export const formatDate = (dateInput) => {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
