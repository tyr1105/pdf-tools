import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import PdfMerge from './pages/PdfMerge'
import PdfSplit from './pages/PdfSplit'
import PdfCompress from './pages/PdfCompress'
import PdfToImage from './pages/PdfToImage'
import PdfWatermark from './pages/PdfWatermark'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge" element={<PdfMerge />} />
        <Route path="/split" element={<PdfSplit />} />
        <Route path="/compress" element={<PdfCompress />} />
        <Route path="/to-image" element={<PdfToImage />} />
        <Route path="/watermark" element={<PdfWatermark />} />
      </Routes>
    </Layout>
  )
}

export default App
