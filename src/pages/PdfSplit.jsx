import { useState, useCallback, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import FileUploader from '../components/FileUploader'

/**
 * PDF拆分工具
 * 支持按页码范围拆分、提取指定页面
 */
export default function PdfSplit() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [pageInput, setPageInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFiles = useCallback(async (files) => {
    const f = files[0]
    setFile(f)
    try {
      const ab = await f.arrayBuffer()
      const pdf = await PDFDocument.load(ab)
      setPageCount(pdf.getPageCount())
      // 默认选择所有页面
      setPageInput(`1-${pdf.getPageCount()}`)
    } catch (err) {
      alert('读取PDF失败: ' + err.message)
      setFile(null)
    }
  }, [])

  const reset = () => {
    setFile(null)
    setPageCount(0)
    setPageInput('')
  }

  // 解析页码输入，支持格式: "1,3,5-8,10"
  const parsePages = (input, max) => {
    const pages = new Set()
    const parts = input.split(',').map(s => s.trim()).filter(Boolean)
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (isNaN(start) || isNaN(end)) continue
        for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
          pages.add(i - 1) // 转为0-based index
        }
      } else {
        const n = Number(part)
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n - 1)
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }

  const handleSplit = async () => {
    if (!file) return
    const pages = parsePages(pageInput, pageCount)
    if (pages.length === 0) {
      alert('请输入有效的页码')
      return
    }

    setProcessing(true)
    setProgress(0)
    try {
      const ab = await file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(ab)
      
      // 如果只选了一部分页面，提取它们
      if (pages.length < pageCount) {
        const newPdf = await PDFDocument.create()
        const copiedPages = await newPdf.copyPages(sourcePdf, pages)
        copiedPages.forEach(p => newPdf.addPage(p))
        const bytes = await newPdf.save()
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const baseName = file.name.replace('.pdf', '')
        saveAs(blob, `${baseName}_提取页面.pdf`)
      } else {
        // 如果选了所有页面，按每页拆分为单独文件
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        const baseName = file.name.replace('.pdf', '')
        
        for (let i = 0; i < pages.length; i++) {
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [pages[i]])
          newPdf.addPage(copiedPage)
          const bytes = await newPdf.save()
          zip.file(`${baseName}_第${pages[i] + 1}页.pdf`, bytes)
          setProgress(Math.round(((i + 1) / pages.length) * 100))
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, `${baseName}_拆分.zip`)
      }
    } catch (err) {
      console.error(err)
      alert('拆分失败: ' + err.message)
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="tool-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">✂️ PDF拆分</h1>
        <p className="text-gray-500">提取PDF中的指定页面或按页拆分</p>
      </div>

      {!file ? (
        <FileUploader onFiles={handleFiles} label="点击或拖拽PDF文件到此处" />
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

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              选择页面
            </label>
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder="例如: 1,3,5-8,10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              支持格式：单页(1)、范围(1-5)、混合(1,3,5-8) · 共 {pageCount} 页
            </p>

            {/* 页面快捷选择 */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                onClick={() => setPageInput(`1-${pageCount}`)}
              >全部页面</button>
              <button
                className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                onClick={() => setPageInput('1')}
              >仅第1页</button>
              {pageCount > 1 && (
                <button
                  className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                  onClick={() => setPageInput(`1-${Math.ceil(pageCount / 2)}`)}
                >前半部分</button>
              )}
              {pageCount > 2 && (
                <button
                  className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                  onClick={() => setPageInput(`${Math.ceil(pageCount / 2) + 1}-${pageCount}`)}
                >后半部分</button>
              )}
              <button
                className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                onClick={() => setPageInput('1,-1')}
              >首页+末页</button>
            </div>
          </div>

          {processing ? (
            <div className="mt-6">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: progress + '%' }} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">正在拆分... {progress}%</p>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <button className="btn-primary" onClick={handleSplit}>
                ✂️ 拆分PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
