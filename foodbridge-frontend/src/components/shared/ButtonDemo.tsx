import { useState } from 'react';
import Button from './Button';

/**
 * Demo component to showcase Button variants, sizes, and states
 * This is for development/testing purposes only
 */
const ButtonDemo = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Button Component Demo</h1>
        <p className="text-gray-600">Showcasing all variants, sizes, and states</p>
      </div>

      {/* Variants */}
      <section className="bg-white p-6 rounded-lg shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className="bg-white p-6 rounded-lg shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Loading State */}
      <section className="bg-white p-6 rounded-lg shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading State</h2>
        <div className="flex flex-wrap gap-4">
          <Button isLoading={isLoading} onClick={handleLoadingClick}>
            {isLoading ? 'Loading...' : 'Click to Load'}
          </Button>
          <Button variant="secondary" isLoading>
            Loading Secondary
          </Button>
          <Button variant="danger" isLoading size="sm">
            Loading Small
          </Button>
        </div>
      </section>

      {/* Disabled State */}
      <section className="bg-white p-6 rounded-lg shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Disabled State</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Primary</Button>
          <Button variant="secondary" disabled>
            Disabled Secondary
          </Button>
          <Button variant="danger" disabled>
            Disabled Danger
          </Button>
          <Button variant="ghost" disabled>
            Disabled Ghost
          </Button>
        </div>
      </section>

      {/* Combined Examples */}
      <section className="bg-white p-6 rounded-lg shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Combined Examples</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="lg">
            Large Primary
          </Button>
          <Button variant="secondary" size="sm">
            Small Secondary
          </Button>
          <Button variant="danger" size="md" onClick={() => alert('Danger clicked!')}>
            Click Me
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ButtonDemo;
