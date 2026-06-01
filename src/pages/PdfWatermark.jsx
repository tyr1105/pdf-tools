import { useState, useCallback } from 'react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import { saveAs } from 'file-saver'
import FileUploader from '../components/FileUploader'

/**
 * PDF加水印工具
 * 支持自定义文字、颜色、大小、透明度、角度
 */
export default function PdfWatermark() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // 水印设置
  const [text, setText] = useState('机密文件')
  const [fontSize, setFontSize] = useState(50)
  const [opacity, setOpacity] = useState(0.15)
  const [rotation, setRotation] = useState(-45)
  const [color, setColor] = useState('#999999')

  const handleFiles = useCallback(async (files) => {
    const f = files[0]
    setFile(f)
    try {
      const ab = await f.arrayBuffer()
      const pdf = await PDFDocument.load(ab)
      setPageCount(pdf.getPageCount())
    } catch (err) {
      alert('读取PDF失败: ' + err.message)
      setFile(null)
    }
  }, [])

  const reset = () => {
    setFile(null)
    setPageCount(0)
  }

  // 十六进制颜色转RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return { r, g, b }
  }

  const handleWatermark = async () => {
    if (!file) return
    if (!text.trim()) {
      alert('请输入水印文字')
      return
    }

    setProcessing(true)
    setProgress(0)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const { r, g, b } = hexToRgb(color)

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()

        // 在页面中心绘制水印（对角线排列）
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        
        page.drawText(text, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(rotation),
        })

        setProgress(Math.round(((i + 1) / pages.length) * 100))
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const baseName = file.name.replace('.pdf', '')
      saveAs(blob, `${baseName}_watermarked.pdf`)
    } catch (err) {
      console.error(err)
      alert('加水印失败: ' + err.message)
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="tool-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">💧 PDF加水印</h1>
        <p className="text-gray-500">给PDF的每一页添加自定义文字水印</p>
      </div>

      {!file ? (
        <FileUploader onFiles={handleFiles} />
      ) : (
        <div>
          <div className="file-item mb-6">
            <div className="flex items-center gap-3">
              <span className="text-red-500">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400">共 {pageCount} 页</p>
              </div>
            </div>
            <button className="text-sm text-gray-400 hover:text-red-500" onClick={reset}>更换文件</button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
            {/* 水印文字 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">水印文字</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入水印文字"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* 字体大小 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">字体大小: {fontSize}px</label>
              <input
                type="range"
                min="20"
                max="120"
                step="5"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 透明度 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">透明度: {Math.round(opacity * 100)}%</label>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 旋转角度 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">旋转角度: {rotation}°</label>
              <input
                type="range"
                min="-90"
                max="90"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 颜色 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">颜色</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <div className="flex gap-2">
                  {['#999999', '#ff0000', '#0066cc', '#009900', '#ff6600'].map(c => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary-500' : 'border-gray-200'}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 水印预览 */}
            <div className="border border-gray-200 rounded-lg p-8 relative overflow-hidden bg-gray-50">
              <div
                className="absolute inset-0 flex items-center justify-center select-none"
                style={{
                  color: color,
                  fontSize: Math.min(fontSize * 0.5, 40) + 'px',
                  opacity: opacity,
                  transform: `rotate(${rotation}deg)`,
                  fontWeight: 'bold',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {text || '水印预览'}
              </div>
              <div className="relative z-10 text-center text-gray-300 text-sm">
                水印效果预览
              </div>
            </div>
          </div>

          {processing ? (
            <div className="mt-6">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: progress + '%' }} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">正在添加水印... {progress}%</p>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <button className="btn-primary" onClick={handleWatermark}>
                💧 添加水印并下载
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
