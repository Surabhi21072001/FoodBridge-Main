import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf8' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="FoodBridge" style={{ height: '64px', width: 'auto' }} />
            </div>

            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#ff6b35', color: 'white' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(/hero-food.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          minHeight: '560px',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 flex items-center">
          <div className="max-w-xl">
            <h1
              className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}
            >
              Discover &amp; Reserve<br />Campus Food
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Connect with dining halls, restaurants, and campus events to access surplus food, reduce waste, and save money.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-7 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#ff6b35' }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-7 py-3 rounded-full font-semibold border border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-16 px-6 lg:px-8" style={{ backgroundColor: '#fafaf8' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left card - teal */}
          <div
            className="rounded-2xl p-8 text-white relative overflow-hidden"
            style={{ backgroundColor: '#2a7c6f', minHeight: '260px' }}
          >
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
              Campus Food Network
            </h3>
            <p className="text-green-100 text-sm leading-relaxed mb-6 max-w-xs">
              Browse listings from dining halls, student clubs, and local restaurants all in one place.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Browse Now
            </button>
            <div className="absolute right-4 bottom-4 w-32 h-32 rounded-xl overflow-hidden opacity-80">
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80" alt="food" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right text block */}
          <div className="px-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mb-4"
              style={{ backgroundColor: '#ff6b35' }}
            >
              1
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
              Personalized for You
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our AI assistant learns your dietary preferences and suggests the best food options available on campus. Get notified when your favorite items are available.
            </p>
          </div>
        </div>
      </section>

      {/* Food Cards Section */}
      <section className="py-8 px-6 lg:px-8" style={{ backgroundColor: '#fafaf8' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Reserve Meals', desc: 'Book surplus food from dining halls before it goes to waste.', emoji: '🍱', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', href: '/info/reserve-meals' },
            { title: 'Pantry Access', desc: 'Schedule pantry appointments and get essential groceries.', emoji: '🛒', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', href: '/info/pantry-access' },
            { title: 'Event Food', desc: 'Find leftover food from campus events and club meetings.', emoji: '🎉', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80', href: '/info/event-food' },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl overflow-hidden relative"
              style={{ backgroundColor: '#1a1a1a', minHeight: '200px' }}
            >
              <img src={card.img} alt={card.title} className="w-full h-full object-cover absolute inset-0 opacity-40" />
              <div className="relative p-6 flex flex-col justify-end h-full" style={{ minHeight: '200px' }}>
                <div className="mt-auto">
                  <span className="text-2xl mb-2 block">{card.emoji}</span>
                  <h4 className="text-white font-bold text-lg mb-1" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
                    {card.title}
                  </h4>
                  <p className="text-gray-300 text-sm">{card.desc}</p>
                  <button
                    onClick={() => navigate(card.href)}
                    className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: '#ff6b35' }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About / Mission Section */}
      <section className="py-16 px-6 lg:px-8" style={{ backgroundColor: '#fafaf8' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden" style={{ height: '320px' }}>
            <img src="https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=80" alt="Community food" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
              Connecting Students<br />with Food
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              FoodBridge reduces campus food waste by connecting students with surplus meals from dining halls, restaurants, and events. Our AI assistant helps you find, reserve, and pick up food effortlessly.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Join Now
            </button>
          </div>
        </div>
      </section>

      {/* Community / Stats Section */}
      <section className="py-16 px-6 lg:px-8" style={{ backgroundColor: '#fafaf8' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - community card */}
          <div
            className="rounded-2xl p-8 text-white relative overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', minHeight: '280px' }}
          >
            <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80" alt="community" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="relative">
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
                Community Impact
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-xs">
                Join thousands of students making a difference by reducing food waste and supporting each other on campus.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: '#ff6b35' }}
              >
                Get Involved
              </button>
            </div>
          </div>

          {/* Right - stats */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: '#fff', border: '1px solid #eee' }}>
            <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
              Our Numbers
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '50K+', label: 'Meals Shared' },
                { value: '1,000+', label: 'Students' },
                { value: '100+', label: 'Providers' },
                { value: '5T', label: 'Waste Prevented' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold mb-1" style={{ color: '#ff6b35', fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1a1a1a' }} className="py-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FoodBridge" style={{ height: '64px', width: 'auto' }} />
          </div>
          <p className="text-gray-500 text-sm">Connecting students with food, reducing waste.</p>
          <p className="text-gray-500 text-sm">&copy; 2026 FoodBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
