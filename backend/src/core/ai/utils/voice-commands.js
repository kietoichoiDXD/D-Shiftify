/**
 * Voice command intent parser for hands-free navigation (accessibility-first).
 *
 * Maps a Vietnamese STT transcript to a navigation intent so visually-impaired users can
 * drive the app entirely by voice. Diacritic-insensitive; longest/most-specific patterns win.
 * No model/training — deterministic keyword + light pattern matching.
 */

const stripDiacritics = value => String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// Ordered by specificity — first match wins.
const INTENTS = [
    { intent: 'next', patterns: ['tiep theo', 'ke tiep', 'viec sau', 'tiep tuc'] },
    { intent: 'previous', patterns: ['quay lai', 'truoc do', 'viec truoc', 'lui lai'] },
    { intent: 'repeat', patterns: ['doc lai', 'lap lai', 'nhac lai', 'noi lai'] },
    { intent: 'apply', patterns: ['ung tuyen', 'nop don', 'nop ho so', 'apply'] },
    { intent: 'match_detail', patterns: ['do phu hop', 'vi sao phu hop', 'diem phu hop'] },
    { intent: 'detail', patterns: ['xem chi tiet', 'chi tiet', 'mo ra', 'xem them'] },
    { intent: 'applications', patterns: ['da ung tuyen', 'don da nop', 'theo doi ung tuyen'] },
    { intent: 'notifications', patterns: ['thong bao', 'thu moi', 'tin nhan moi'] },
    { intent: 'messages', patterns: ['tin nhan', 'nhan tin', 'tro chuyen'] },
    { intent: 'profile', patterns: ['ho so', 'thong tin ca nhan', 'trang ca nhan'] },
    { intent: 'home', patterns: ['trang chu', 'dashboard', 'tong quan', 've dau trang'] },
    { intent: 'stop', patterns: ['dung lai', 'im lang', 'tat tieng', 'ngung doc', 'dung'] },
    { intent: 'help', patterns: ['tro giup', 'huong dan', 'giup toi', 'lam sao'] },
];

const SEARCH_TRIGGERS = ['tim viec', 'tim cong viec', 'tim kiem', 'tim'];

/**
 * @param {string} transcript raw STT transcript
 * @returns {{intent: string, query: string|null, matched: string|null, raw: string}}
 */
export const parseVoiceCommand = transcript => {
    const normalized = stripDiacritics(transcript);
    const raw = String(transcript || '').trim();
    if (!normalized) return { intent: 'unknown', query: null, matched: null, raw };

    // Search is special: it carries a free-text query after the trigger word.
    for (const trigger of SEARCH_TRIGGERS) {
        if (normalized.startsWith(`${trigger} `) || normalized === trigger) {
            const triggerWordCount = trigger.split(' ').length;
            const query = raw.split(/\s+/).slice(triggerWordCount).join(' ').trim();
            return { intent: 'search', query: query || null, matched: trigger, raw };
        }
    }

    for (const { intent, patterns } of INTENTS) {
        const matched = patterns.find(pattern => normalized === pattern || normalized.includes(pattern));
        if (matched) return { intent, query: null, matched, raw };
    }

    return { intent: 'unknown', query: null, matched: null, raw };
};

/** Map intent → human-readable confirmation, useful for TTS feedback. */
export const describeIntent = intent => ({
    next: 'Chuyển sang mục tiếp theo',
    previous: 'Quay lại mục trước',
    repeat: 'Đọc lại nội dung',
    apply: 'Ứng tuyển công việc',
    detail: 'Mở chi tiết',
    match_detail: 'Xem chi tiết độ phù hợp',
    applications: 'Mở danh sách đã ứng tuyển',
    notifications: 'Mở thông báo',
    messages: 'Mở tin nhắn',
    profile: 'Mở hồ sơ',
    home: 'Về trang tổng quan',
    search: 'Tìm việc',
    stop: 'Dừng đọc',
    help: 'Trợ giúp',
    unknown: 'Không nhận diện được lệnh',
}[intent] || 'Không nhận diện được lệnh');
