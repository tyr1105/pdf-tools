import { useCallback, useState } from 'react'

/**
 * 通用文件上传组件
 * @param {Object} props
 * @param {string} props.accept - 接受的文件类型，如 '.pdf'
 * @param {boolean} props.multiple - 是否支持多文件
 * @param {Function} props.onFiles - 文件选择回调
 * @param {string} props.label - 上传区域提示文字
 * @param {number} props.maxSize - 单文件最大大小（字节），默认50MB
 */
export default function FileUploader({ 
  accept = '.pdf', 
  multiple = false, 
  onFiles, 
  label = '点击或拖拽PDF文件到此处',
  maxSize = 50 * 1024 * 1024 
}) {
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList)
    const valid = files.filter(f => {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        alert(`"${f.name}" 不是PDF文件，已跳过`)
        return false
      }
      if (f.size > maxSize) {
        alert(`"${f.name}" 超过50MB限制，已跳过`)
        return false
      }
      return true
    })
    if (valid.length > 0) onFiles(valid)
  }, [onFiles, maxSize])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleChange = useCallback((e) => {
    handleFiles(e.target.files)
    e.target.value = '' // 重置以允许重复选择同一文件
  }, [handleFiles])

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <div className="text-5xl mb-4">📁</div>
      <p className="text-lg text-gray-600 mb-2">{label}</p>
      <p className="text-sm text-gray-400">支持拖拽上传 · 最大50MB · 文件不会上传到服务器</p>
    </div>
  )
}
