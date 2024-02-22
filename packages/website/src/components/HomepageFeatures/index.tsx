import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

interface FeatureItem {
  title: string;
  picture: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Effortless Background Removal',
    picture: require('@site/static/img/feature1.png').default,
    description: (
      <>
        Enhance your images effortlessly with our background removal tool. It's intuitive and supports multiple models for diverse editing needs, ensuring standout results quickly.
      </>
    ),
  },
  {
    title: 'Privacy and Local Execution',
    picture: require('@site/static/img/feature2.png').default,
    description: (
      <>
        Guarantee your privacy with our local processing feature. Your images are processed on your device, ensuring data security and swift performance without the need for internet uploads.
      </>
    ),
  },
  {
    title: 'Open Source and Free',
    picture: require('@site/static/img/feature3.png').default,
    description: (
      <>
       Unleash your creativity without limits. Our tool is open-source and entirely free.
      </>
    ),
  },
];

function Feature({title, picture, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={clsx(styles.featureSvg, 'inline-block')} alt={title} src={picture} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3" className="py-2 text-xl font-bold">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
