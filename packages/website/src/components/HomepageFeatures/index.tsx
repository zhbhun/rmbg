import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'

interface FeatureItem {
  title: string
  picture: string
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: 'AI-Powered Background Removal',
    picture: require('@site/static/img/feature1.png').default,
    description: (
      <>
        RMBG leverages multiple AI models to quickly and efficiently remove
        backgrounds from your images.
      </>
    )
  },
  {
    title: 'Privacy and Local Execution',
    picture: require('@site/static/img/feature2.png').default,
    description: (
      <>
        Guarantee your privacy with our local processing feature. Your images
        are processed on your device, ensuring data security and swift
        performance without the need for internet uploads.
      </>
    )
  },
  {
    title: 'Open Source and Free',
    picture: require('@site/static/img/feature3.png').default,
    description: (
      <>
        Unleash your creativity without limits. Our tool is open-source and
        entirely free.
      </>
    )
  }
]

function Feature({ title, picture, description }: FeatureItem) {
  return (
    <div className="flex flex-col mb-24 md:flex-row md:items-center md:mb-30 last:mb-0">
      <div className="mb-8 text--center md:shrink-0 md:w-[300px] lg:w-[400px]">
        <img
          className={clsx(styles.featureSvg, 'inline-block')}
          alt={title}
          src={picture}
        />
      </div>
      <div className="text-center padding-horiz--md md:text-left">
        <Heading as="h3" className="py-2 text-xl font-bold">
          {title}
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <div className="container py-24">
      {FeatureList.map((props, idx) => (
        <Feature key={idx} {...props} />
      ))}
    </div>
  )
}
