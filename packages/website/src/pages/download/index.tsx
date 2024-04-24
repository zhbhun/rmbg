import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import WindowsIcon from '../../icons/WindowsIcon'
import LinuxIcon from '../../icons/LinuxIcon'
import AppleIcon from '../../icons/AppleIcon'

const resources = [
  {
    name: 'RMBG_0.0.1_x64-setup.exe',
    icon: <WindowsIcon className="text-8xl" />,
    title: 'Windows',
    download:
      'https://github.com/zhbhun/rmbg/releases/download/v0.0.1/RMBG_0.0.1_x64-setup.exe'
  },
  {
    name: 'rmbg_0.0.1_amd64.deb',
    icon: <LinuxIcon className="text-8xl" />,
    title: 'Linux',
    download:
      'https://github.com/zhbhun/rmbg/releases/download/v0.0.1/rmbg_0.0.1_amd64.deb'
  },
  {
    name: 'RMBG_0.0.1_aarch64.dmg',
    icon: <AppleIcon className="text-8xl" />,
    title: 'macOS',
    download:
      'https://github.com/zhbhun/rmbg/releases/download/v0.0.1/RMBG_0.0.1_aarch64.dmg'
  }
]

export default function Playground(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="RMBG download page."
    >
      <div
        className="container flex flex-col items-center justify-center py-10"
        style={{
          minHeight: 'calc(100vh - 260px)'
        }}
      >
        <div className="flex flex-col items-center justify-center gap-20 md:flex-row">
          {resources.map((resource, index) => (
            <a
              key={index}
              className="flex flex-col items-center"
              href={resource.download}
              download={resource.name}
            >
              {resource.icon}
              <div className="mt-4 text-xl">{resource.title}</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  )
}
