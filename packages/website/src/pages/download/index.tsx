import Layout from '@theme/Layout'
import Download from '../../components/Download'

export default function Playground(): JSX.Element {
  return (
    <Layout
      title="Remove Image Backgrounds for Free – Locally and with Open Source via rmbg.fun."
      description="Remove image backgrounds for free, locally and securely, using the open-source tool rmbg.fun, no internet connection required."
    >
      <Download
        style={{
          minHeight: 'calc(100vh - 260px)'
        }}
      />
    </Layout>
  )
}
