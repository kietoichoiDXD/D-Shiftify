const AT_MAP = {
  screen_reader: ['nvda', 'jaws', 'voiceover', 'narrator', 'orca', 'trình đọc màn hình', 'đọc màn hình', 'screen reader'],
  braille:       ['braille', 'chữ nổi', 'màn hình chữ nổi', 'bàn phím chữ nổi', 'braille display', 'refreshable braille'],
  magnifier:     ['kính lúp', 'phóng to màn hình', 'zoom text', 'magnifier', 'zoomtext', 'supernova', 'tăng cỡ chữ'],
  voice_control: ['điều khiển giọng nói', 'voice control', 'dragon naturally speaking', 'dragon', 'ra lệnh bằng giọng', 'nói để điều khiển'],
  large_text:    ['chữ to', 'cỡ chữ lớn', 'large text', 'high contrast', 'tương phản cao', 'màu nền tối'],
  no_video:      ['không xem video', 'không nhìn được video', 'audio only', 'chỉ nghe'],
};

export const detectATTools = (text) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  return Object.entries(AT_MAP)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([need]) => need);
};

export const mergeATNeeds = (existing = [], text = '') =>
  [...new Set([...existing, ...detectATTools(text)])];
