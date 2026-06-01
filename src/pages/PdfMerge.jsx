import { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import FileUploader from '../components/FileUploader'

/**
 * PDF合并工具
 * 支持多文件上传、拖拽排序、一键合并下载
 */
export default function PdfMerge() {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFiles = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...newFiles.map((f, i) => ({
      id: Date.now() + i,
      file: f,
      name: f.name,
      size: f.size,
    }))])
  }, [])

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const moveFile = (index, direction) => {
    const newFiles = [...files]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newFiles.length) return
    ;[newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
    setFiles(newFiles)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('请至少选择2个PDF文件')
      return
    }
    setProcessing(true)
    setProgress(0)
    try {
      const mergedPdf = await PDFDocument.create()
      
      for (let i = 0; i < files.length; i++) {
        const arrayBuffer = await files[i].file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach(page => mergedPdf.addPage(page))
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      saveAs(blob, 'merged.pdf')
    } catch (err) {
      console.error(err)
      alert('合并失败: ' + err.message)
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="tool-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📎 PDF合并</h1>
        <p className="text-gray-500">将多个PDF文件合并为一个文档</p>
      </div>

      <FileUploader
        multiple
        onFiles={handleFiles}
        label="点击或拖拽多个PDF文件到此处"
      />

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">已选择 {files.length} 个文件</h3>
            <button 
              className="text-sm text-red-500 hover:text-red-700"
              onClick={() => setFiles([])}
            >
              清空全部
            </button>
          </div>

          <div className="space-y-2">
            {files.map((f, index) => (
              <div key={f.id} className="file-item">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-mono w-6 text-center">{index + 1}</span>
                  <span className="text-red-500">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{f.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(f.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    onClick={() => moveFile(index, -1)}
                    disabled={index === 0}
                    title="上移"
                  >▲</button>
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    onClick={() => moveFile(index, 1)}
                    disabled={index === files.length - 1}
                    title="下移"
                  >▼</button>
                  <button
                    className="p-1 text-red-400 hover:text-red-600"
                    onClick={() => removeFile(f.id)}
                    title="删除"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>

          {processing ? (
            <div className="mt-6">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: progress + '%' }} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">正在合并... {progress}%</p>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <button
                className="btn-primary"
                onClick={handleMerge}
                disabled={files.length < 2}
              >
                🔗 合并 {files.length} 个文件
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
