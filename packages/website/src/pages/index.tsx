import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import Playground from '../components/Playground'
import Download from '../components/Download'

import styles from './index.module.css'

export default function Home(): JSX.Element {
  return (
    <Layout
      wrapperClassName={styles.layout}
      title="Remove Image Backgrounds for Free – Locally and with Open Source via rmbg.fun."
      description="Remove image backgrounds for free, locally and securely, using the open-source tool rmbg.fun, no internet connection required."
    >
      <main>
        <Playground />
        <HomepageFeatures />
        <div className="pb-24">
          <Download header={<h2 className="mb-12">Download</h2>} />
        </div>
      </main>
    </Layout>
  )
}
