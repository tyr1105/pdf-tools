import { Link, useLocation } from 'react-router-dom'

const tools = [
  { path: '/merge', name: 'PDF合并', icon: '📎', desc: '多个PDF合并为一个' },
  { path: '/split', name: 'PDF拆分', icon: '✂️', desc: '拆分PDF提取指定页面' },
  { path: '/compress', name: 'PDF压缩', icon: '📦', desc: '减小PDF文件体积' },
  { path: '/to-image', name: 'PDF转图片', icon: '🖼️', desc: 'PDF页面转为PNG/JPG' },
  { path: '/watermark', name: 'PDF加水印', icon: '💧', desc: '给PDF添加文字水印' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700 no-underline">
            <span className="text-2xl">📄</span>
            <span>PDF工具箱</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {tools.map(tool => (
              <Link
                key={tool.path}
                to={tool.path}
                className={`px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                  location.pathname === tool.path
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tool.icon} {tool.name}
              </Link>
            ))}
          </nav>
          {/* 移动端菜单 */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto">
            {tools.map(tool => (
              <Link
                key={tool.path}
                to={tool.path}
                className={`px-2 py-1 rounded text-xs whitespace-nowrap no-underline ${
                  location.pathname === tool.path
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {tool.icon}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p className="mb-2">🔒 所有文件处理均在您的浏览器本地完成，绝不上传服务器</p>
          <p>PDF工具箱 © 2026 · 免费在线PDF处理工具</p>
        </div>
      </footer>
    </div>
  )
}
