/**
 * AT Tool Detection — Accessibility Technology
 * Maps keywords → accessibility_needs[] used in profile + AT match scoring
 */

const AT_MAP = {
  screen_reader: [
    'nvda', 'jaws', 'voiceover', 'narrator', 'orca',
    'trình đọc màn hình', 'đọc màn hình', 'screen reader',
  ],
  braille: [
    'braille', 'chữ nổi', 'màn hình chữ nổi', 'bàn phím chữ nổi',
    'braille display', 'refreshable braille',
  ],
  magnifier: [
    'kính lúp', 'phóng to màn hình', 'zoom text', 'magnifier',
    'zoomtext', 'supernova', 'tăng cỡ chữ',
  ],
  voice_control: [
    'điều khiển giọng nói', 'voice control', 'dragon naturally speaking',
    'dragon', 'ra lệnh bằng giọng', 'nói để điều khiển',
  ],
  large_text: [
    'chữ to', 'cỡ chữ lớn', 'large text', 'high contrast',
    'tương phản cao', 'màu nền tối',
  ],
  no_video: [
    'không xem video', 'không nhìn được video', 'audio only', 'chỉ nghe',
  ],
};

/**
 * Detect AT tools from free text.
 * @param {string} text
 * @returns {string[]} accessibility_needs — e.g. ['screen_reader', 'braille']
 */
export const detectATTools = (text) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  return Object.entries(AT_MAP)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([need]) => need);
};

/**
 * Merge detected AT tools into existing accessibility_needs (dedup).
 * @param {string[]} existing
 * @param {string}   text
 * @returns {string[]}
 */
export const mergeATNeeds = (existing = [], text = '') =>
  [...new Set([...existing, ...detectATTools(text)])];
