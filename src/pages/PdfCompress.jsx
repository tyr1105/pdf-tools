import { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import FileUploader from '../components/FileUploader'

/**
 * PDF压缩工具
 * 通过重新编码PDF中的图片来减小文件体积
 * 使用canvas重绘降低图片质量
 */
export default function PdfCompress() {
  const [file, setFile] = useState(null)
  const [quality, setQuality] = useState(0.6)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleFiles = useCallback((files) => {
    const f = files[0]
    setFile(f)
    setResult(null)
  }, [])

  const reset = () => {
    setFile(null)
    setResult(null)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleCompress = async () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      const pages = pdfDoc.getPages()
      
      // 使用canvas重绘每一页来压缩
      // 加载pdfjs用于渲染页面到canvas
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = ''
      
      // 用pdfjs渲染每一页到canvas，然后以指定质量重新嵌入
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdfProxy = await loadingTask.promise
      
      const newPdf = await PDFDocument.create()
      
      for (let i = 0; i < pdfProxy.numPages; i++) {
        const page = await pdfProxy.getPage(i + 1)
        const viewport = page.getViewport({ scale: 1.5 }) // 缩放因子控制质量
        
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        
        await page.render({ canvasContext: ctx, viewport }).promise
        
        // 将canvas转为JPEG并嵌入新PDF
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality)
        const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(',')[1]), c => c.charCodeAt(0))
        
        const jpegImage = await newPdf.embedJpg(jpegBytes)
        const newPage = newPdf.addPage([viewport.width, viewport.height])
        newPage.drawImage(jpegImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        })
        
        setProgress(Math.round(((i + 1) / pdfProxy.numPages) * 100))
      }

      const compressedBytes = await newPdf.save()
      const blob = new Blob([compressedBytes], { type: 'application/pdf' })
      
      const originalSize = file.size
      const compressedSize = compressedBytes.length
      const reduction = Math.round((1 - compressedSize / originalSize) * 100)
      
      setResult({
        blob,
        originalSize,
        compressedSize,
        reduction,
      })
    } catch (err) {
      console.error(err)
      alert('压缩失败: ' + err.message)
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const downloadResult = () => {
    if (!result) return
    const baseName = file.name.replace('.pdf', '')
    saveAs(result.blob, `${baseName}_compressed.pdf`)
  }

  return (
    <div className="tool-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 PDF压缩</h1>
        <p className="text-gray-500">压缩PDF中的图片，减小文件体积</p>
      </div>

      {!file ? (
        <FileUploader onFiles={handleFiles} />
      ) : !result ? (
        <div>
          <div className="file-item mb-6">
            <div className="flex items-center gap-3">
              <span className="text-red-500">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
              </div>
            </div>
            <button className="text-sm text-gray-400 hover:text-red-500" onClick={reset}>更换文件</button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              压缩质量: {quality <= 0.4 ? '高压缩' : quality <= 0.7 ? '均衡' : '高质量'}
            </label>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>文件更小</span>
              <span>质量更高</span>
            </div>
          </div>

          {processing ? (
            <div className="mt-6">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: progress + '%' }} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">正在压缩... {progress}%</p>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <button className="btn-primary" onClick={handleCompress}>
                📦 开始压缩
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">压缩完成</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">原始大小</p>
              <p className="text-lg font-bold text-gray-700">{formatSize(result.originalSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">压缩后</p>
              <p className="text-lg font-bold text-primary-600">{formatSize(result.compressedSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">减小了</p>
              <p className="text-lg font-bold text-green-600">{result.reduction}%</p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button className="btn-primary" onClick={downloadResult}>
              💾 下载压缩文件
            </button>
            <button className="btn-secondary" onClick={reset}>
              压缩另一个文件
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
