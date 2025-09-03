import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          Simtricity Documentation
        </Heading>
        <p className={styles.heroSubtitle}>
          Build and manage energy communities with our comprehensive platform for metering, billing, and energy trading
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function ProductSection() {
  return (
    <section className={styles.productSection}>
      <div className="container">
        <Heading as="h2" className={styles.productSectionTitle}>
          Choose your product to get started
        </Heading>
      </div>
    </section>
  );
}

function ProductCards() {
  const products = [
    {
      title: 'Flows',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.productSvgIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      description: 'Smart meter management and energy flow monitoring',
      link: '/docs/flows',
      buttonText: 'Enter Flows',
      buttonClass: 'button--flows'
    },
    {
      title: 'Flux',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.productSvgIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      description: 'Energy market trading and optimization platform',
      link: '/docs/flux',
      buttonText: 'Enter Flux',
      buttonClass: 'button--flux'
    },
    {
      title: 'MyEnergy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.productSvgIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      description: 'Personal energy management and insights',
      link: '/docs/myenergy',
      buttonText: 'Enter MyEnergy',
      buttonClass: 'button--myenergy'
    }
  ];

  return (
    <section className={styles.products}>
      <div className="container">
        <div className={styles.productGrid}>
          {products.map((product, idx) => (
            <div key={idx} className={styles.productCard}>
              <div className={styles.productIcon}>
                {product.icon}
              </div>
              <Heading as="h2" className={styles.productTitle}>
                {product.title}
              </Heading>
              <p className={styles.productDescription}>
                {product.description}
              </p>
              <Link
                className={clsx('button', 'button--lg', styles[product.buttonClass])}
                to={product.link}>
                {product.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  const links = [
    {
      title: 'API Reference',
      description: 'Complete REST API documentation',
      link: '/docs/api-reference',
      icon: '🔌'
    },
    {
      title: 'CLI Tools',
      description: 'Command-line tools and utilities',
      link: '/docs/flows/cli',
      icon: '💻'
    },
    {
      title: 'Getting Started',
      description: 'Quick start guides and tutorials',
      link: '/docs/getting-started',
      icon: '🚀'
    },
    {
      title: 'GitHub',
      description: 'View source code',
      link: 'https://github.com/simtricity',
      icon: '📖'
    }
  ];

  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Quick Links
        </Heading>
        <div className={styles.quickLinksGrid}>
          {links.map((link, idx) => (
            <Link
              key={idx}
              className={styles.quickLinkCard}
              to={link.link}>
              <div className={styles.quickLinkIcon}>{link.icon}</div>
              <div>
                <h4 className={styles.quickLinkTitle}>{link.title}</h4>
                <p className={styles.quickLinkDescription}>
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Documentation"
      description="Simtricity - Building the Future of Local Energy">
      <HomepageHeader />
      <main>
        <ProductSection />
        <ProductCards />
        <QuickLinks />
      </main>
    </Layout>
  );
}