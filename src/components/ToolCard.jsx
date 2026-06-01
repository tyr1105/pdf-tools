import { Link } from 'react-router-dom'

/**
 * 首页工具卡片组件
 */
export default function ToolCard({ path, icon, name, desc, color = 'bg-primary-50 text-primary-700' }) {
  return (
    <Link
      to={path}
      className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200 no-underline group"
    >
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{name}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  )
}
