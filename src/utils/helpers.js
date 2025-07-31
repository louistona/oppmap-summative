import { CATEGORY_COLORS, SEVERITY_COLORS, CATEGORY_LABELS, SEVERITY_LABELS } from './constants'

export const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#6B7280'
}

export const getSeverityColor = (severity) => {
  return SEVERITY_COLORS[severity] || '#6B7280'
}

export const getCategoryLabel = (category) => {
  return CATEGORY_LABELS[category] || category
}

export const getSeverityLabel = (severity) => {
  return SEVERITY_LABELS[severity] || severity
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const createMarkerIcon = (category, severity) => {
  const color = getCategoryColor(category)
  const size = Math.max(20, severity * 4) // Size based on severity
  
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${Math.max(10, size * 0.4)}px;
    ">
      ${severity}
    </div>
  `
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}