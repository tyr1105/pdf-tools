import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import FileUploader from '../components/FileUploader'

/**
 * PDF转图片工具
 * 将PDF每一页渲染为高清PNG或JPG图片
 * 支持批量下载为ZIP
 */
export default function PdfToImage() {
  const [file, setFile] = useState(null)
  const [scale, setScale] = useState(2)
  const [format, setFormat] = useState('png')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [images, setImages] = useState([])

  const handleFiles = useCallback((files) => {
    setFile(files[0])
    setImages([])
  }, [])

  const reset = () => {
    setFile(null)
    setImages([])
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
    setImages([])

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = ''
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const renderedImages = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        
        await page.render({ canvasContext: ctx, viewport }).promise
        
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(mimeType, 0.92)
        
        renderedImages.push({
          pageNum: i,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        })
        
        setProgress(Math.round((i / pdf.numPages) * 100))
      }

      setImages(renderedImages)
    } catch (err) {
      console.error(err)
      alert('转换失败: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const downloadImage = (img) => {
    const ext = format === 'png' ? 'png' : 'jpg'
    const baseName = file.name.replace('.pdf', '')
    const link = document.createElement('a')
    link.href = img.dataUrl
    link.download = `${baseName}_page${img.pageNum}.${ext}`
    link.click()
  }

  const downloadAll = async () => {
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    const baseName = file.name.replace('.pdf', '')
    const ext = format === 'png' ? 'png' : 'jpg'

    for (const img of images) {
      const response = await fetch(img.dataUrl)
      const blob = await response.blob()
      zip.file(`${baseName}_第${img.pageNum}页.${ext}`, blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `${baseName}_images.zip`)
  }

  return (
    <div className="tool-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🖼️ PDF转图片</h1>
        <p className="text-gray-500">将PDF每一页转换为高清PNG或JPG图片</p>
      </div>

      {!file ? (
        <FileUploader onFiles={handleFiles} />
      ) : images.length === 0 ? (
        <div>
          <div className="file-item mb-6">
            <div className="flex items-center gap-3">
              <span className="text-red-500">📄</span>
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
            </div>
            <button className="text-sm text-gray-400 hover:text-red-500" onClick={reset}>更换文件</button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">输出格式</label>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      format === 'png' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setFormat('png')}
                  >PNG (无损)</button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      format === 'jpg' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setFormat('jpg')}
                  >JPG (更小)</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  清晰度: {scale}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>标准</span>
                  <span>超高清</span>
                </div>
              </div>
            </div>
          </div>

          {processing ? (
            <div className="mt-6">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: progress + '%' }} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">正在转换... {progress}%</p>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <button className="btn-primary" onClick={handleConvert}>
                🖼️ 开始转换
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-700">共 {images.length} 张图片</h3>
            <div className="flex gap-2">
              <button className="btn-primary text-sm py-2 px-4" onClick={downloadAll}>
                📥 下载全部 (ZIP)
              </button>
              <button className="btn-secondary text-sm py-2 px-4" onClick={reset}>
                转换另一个
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div
                key={img.pageNum}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => downloadImage(img)}
              >
                <img
                  src={img.dataUrl}
                  alt={`第${img.pageNum}页`}
                  className="w-full h-auto"
                />
                <div className="p-2 text-center text-xs text-gray-500">
                  第 {img.pageNum} 页 · {img.width}×{img.height}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
