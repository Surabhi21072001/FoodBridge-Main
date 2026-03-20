import { useNavigate } from 'react-router-dom';

export default function ReserveMealsInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf8' }}>
      {/* Nav */}
      <nav style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/logo.png" alt="FoodBridge" style={{ height: '64px', width: 'auto' }} />
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-full text-sm font-semibold border border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '380px',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 flex items-center">
          <div className="max-w-xl">
            <span className="text-4xl mb-4 block">🍱</span>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
              Reserve Meals
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Book surplus food from dining halls before it goes to waste — fresh, affordable, and ready for pickup.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: '🔍', title: 'Browse Listings', desc: 'Search surplus meals from dining halls and campus restaurants filtered by dietary needs, cuisine, and pickup time.' },
              { icon: '📅', title: 'Reserve Instantly', desc: 'Claim your portion in seconds. The system tracks quantities in real time so you always know what\'s available.' },
              { icon: '🤖', title: 'AI Recommendations', desc: 'Our assistant learns your preferences and proactively suggests meals you\'ll love before they run out.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: '1px solid #eee' }}>
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#1a1a1a' }}>{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8 mb-10" style={{ backgroundColor: '#2a7c6f' }}>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
              How it works
            </h2>
            <ol className="text-green-100 text-sm leading-relaxed space-y-2 list-decimal list-inside">
              <li>Providers post surplus food listings with quantity, pickup window, and dietary tags.</li>
              <li>You browse or ask the AI assistant to find something that fits your preferences.</li>
              <li>Reserve your portion — you'll get a confirmation and calendar reminder.</li>
              <li>Pick up during the listed window. No payment needed for donated meals.</li>
            </ol>
          </div>

          <div className="text-center">
            <p className="text-gray-500 mb-4">Ready to stop missing out on free campus food?</p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Create Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1a1a1a' }} className="py-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <img src="/logo.png" alt="FoodBridge" style={{ height: '48px', width: 'auto' }} />
          <p className="text-gray-500 text-sm">&copy; 2026 FoodBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
