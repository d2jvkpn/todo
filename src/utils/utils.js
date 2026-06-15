/**
 * crypto.randomUUID() 仅在安全上下文（HTTPS / localhost）可用，
 * 通过局域网 IP 访问时降级为时间戳 + 随机数
 */
export function generateId() {
  return window.isSecureContext
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/** 折叠换行符并在超过 max 字符时截断，末尾加省略号 */
export function truncate(text, max = 15) {
  const oneline = text.replace(/\s+/g, ' ').trim()
  return oneline.length > max ? oneline.slice(0, max) + '…' : oneline
}

/**
 * 触发浏览器文件下载。
 * 优先使用 File System Access API（showSaveFilePicker），
 * 不支持时降级为创建临时 <a> 元素并点击。
 */
export async function downloadFile(content, filename, mimeType = 'application/json') {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: mimeType, accept: { [mimeType]: [`.${filename.split('.').pop()}`] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
      return
    } catch {
      // 用户取消，不做任何操作
    }
  }

  // 降级：触发浏览器下载
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
