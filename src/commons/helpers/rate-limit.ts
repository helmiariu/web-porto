export function checkContactRateLimit() {
  if (typeof window === "undefined") {
    return { allowed: true, remainingTime: null };
  }
  const lastSubmission = localStorage.getItem("contact_last_submission");
  if (!lastSubmission) {
    return { allowed: true, remainingTime: null };
  }
  const timePassed = Math.floor((Date.now() - parseInt(lastSubmission)) / 1000);
  const limitSeconds = 300; // 5 minutes
  if (timePassed < limitSeconds) {
    return { allowed: false, remainingTime: limitSeconds - timePassed };
  }
  return { allowed: true, remainingTime: null };
}

export function recordContactSubmission() {
  if (typeof window !== "undefined") {
    localStorage.setItem("contact_last_submission", Date.now().toString());
  }
}

export function formatRemainingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}
