export const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const yyyy = today.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dd = String(tomorrow.getDate()).padStart(2, "0");
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const yyyy = tomorrow.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};
