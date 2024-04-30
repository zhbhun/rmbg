import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import Heading from '@theme/Heading'
import Playground from '../components/Playground'

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className="bg-[#fef8e8]">
      <div className="container flex flex-col justify-between items-center py-8 md:flex-row">
        <div className="py-8 flex flex-col items-center md:flex-[1] md:min-w-[300px] md:items-start">
          <Heading
            as="h1"
            className="mb-4 text-4xl text-center font-semibold uppercase md:text-left"
          >
            {siteConfig.title}
          </Heading>
          <p className="mb-4 text-sm text-[#666] lg:text-xl">
            {siteConfig.tagline}
          </p>
          <div>
            <Link className="button button--primary button--lg" to="/trial">
              Get started
            </Link>
          </div>
        </div>
        <div className="md:flex-[2]">
          <img
            className="max-w-full"
            src={require('@site/static/img/hero.png').default}
          />
        </div>
      </div>
    </header>
  )
}

export default function Home(): JSX.Element {
  return (
    <Layout
      wrapperClassName={styles.layout}
      title="Remove Image Backgrounds for Free – Locally and with Open Source via rmbg.fun."
      description="Description will go into a meta tag in <head />"
    >
      <main>
        <Playground />
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
