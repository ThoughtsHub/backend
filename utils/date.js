export const getTodayDate = () => {
  const now = new Date();

  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istTime = new Date(
    now.getTime() + now.getTimezoneOffset() * 60000 + istOffset
  );

  const day = String(istTime.getDate()).padStart(2, "0");
  const month = String(istTime.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = istTime.getFullYear();

  return `${day}-${month}-${year}`;
};

export const getTomorrowDate = () => {
  const now = new Date();

  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istNow = new Date(utc + istOffset);

  // Add 1 day
  istNow.setDate(istNow.getDate() + 1);

  const day = String(istNow.getDate()).padStart(2, "0");
  const month = String(istNow.getMonth() + 1).padStart(2, "0");
  const year = istNow.getFullYear();

  return `${day}-${month}-${year}`;
};

export const checkDateLessEqualThanToday = (dateStr) => {
  // Parse input date string (dd-mm-yyyy)
  const [day, month, year] = dateStr.split("-").map(Number);
  const inputDate = new Date(Date.UTC(year, month - 1, day));

  // Get today's IST date (ignoring time)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const istNow = new Date(utcNow + istOffset);

  // Create IST date object with time set to 00:00:00 for comparison
  const todayISTDate = new Date(
    Date.UTC(istNow.getFullYear(), istNow.getMonth(), istNow.getDate())
  );

  return inputDate.getTime() <= todayISTDate.getTime();
};
