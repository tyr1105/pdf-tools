import ToolCard from '../components/ToolCard'

const tools = [
  { path: '/merge', icon: '📎', name: 'PDF合并', desc: '将多个PDF文件合并为一个文档，支持自定义排序', color: 'bg-blue-50 text-blue-700' },
  { path: '/split', icon: '✂️', name: 'PDF拆分', desc: '从PDF中提取指定页面，或按范围拆分', color: 'bg-green-50 text-green-700' },
  { path: '/compress', icon: '📦', name: 'PDF压缩', desc: '压缩PDF中的图片，大幅减小文件体积', color: 'bg-orange-50 text-orange-700' },
  { path: '/to-image', icon: '🖼️', name: 'PDF转图片', desc: '将PDF每一页转换为高清PNG或JPG图片', color: 'bg-purple-50 text-purple-700' },
  { path: '/watermark', icon: '💧', name: 'PDF加水印', desc: '给PDF的每一页添加自定义文字水印', color: 'bg-red-50 text-red-700' },
]

export default function Home() {
  return (
    <div>
      {/* Hero区域 */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📄 免费在线PDF工具箱
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-2">
            合并、拆分、压缩、转图片、加水印 — 所有操作一键完成
          </p>
          <p className="text-sm text-primary-200">
            🔒 文件全程在浏览器本地处理，绝不上传服务器，保护您的隐私安全
          </p>
        </div>
      </section>

      {/* 工具列表 */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <ToolCard key={tool.path} {...tool} />
          ))}
        </div>
      </section>

      {/* 特点说明 */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">为什么选择我们？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-gray-800 mb-2">隐私安全</h3>
              <p className="text-sm text-gray-500">所有操作在浏览器本地完成，文件不会上传到任何服务器</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-800 mb-2">极速处理</h3>
              <p className="text-sm text-gray-500">无需等待上传下载，本地处理速度更快，大文件也不在话下</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-gray-800 mb-2">完全免费</h3>
              <p className="text-sm text-gray-500">所有功能免费使用，无隐藏收费，无水印，无文件数量限制</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
