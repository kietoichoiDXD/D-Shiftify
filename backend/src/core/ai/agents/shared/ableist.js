const ABLEIST = [
  { pattern: /nhìn thấy vấn đề/gi,     fix: 'nhận ra vấn đề' },
  { pattern: /nhanh nhẹn/gi,            fix: 'linh hoạt' },
  { pattern: /năng động/gi,             fix: 'chủ động, nhiệt tình' },
  { pattern: /quan sát trực tiếp/gi,    fix: 'theo dõi, giám sát' },
  { pattern: /đẹp mắt/gi,               fix: 'chuyên nghiệp, rõ ràng' },
  { pattern: /bình thường/gi,           fix: 'không có yêu cầu đặc biệt' },
  { pattern: /lành lặn/gi,              fix: 'đủ năng lực' },
  { pattern: /khỏe mạnh bình thường/gi, fix: 'đủ sức khỏe làm việc' },
];

export const sanitizeAbleist = (text) => {
  if (!text) return text;
  let result = text;
  for (const { pattern, fix } of ABLEIST) result = result.replace(pattern, fix);
  return result;
};
