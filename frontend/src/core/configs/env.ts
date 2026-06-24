const mockDataFlag = String(import.meta.env.VITE_USE_MOCK_DATA ?? import.meta.env.USE_MOCK_DATA ?? 'true').toLowerCase()

const config = {
  baseUrl: import.meta.env.VITE_API_URL || '',
  socketUrl: import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '',
  useMockChat: import.meta.env.VITE_USE_MOCK_CHAT === 'true',
  maxSizeUploadAvatar: 1048576,
  useMockData: ['true', '1', 'yes'].includes(mockDataFlag) || (!import.meta.env.VITE_API_URL && mockDataFlag !== 'false')
}

export default config
