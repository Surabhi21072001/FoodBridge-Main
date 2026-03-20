import { useNavigate } from 'react-router-dom';

export default function EventFoodInfoPage() {
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
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '380px',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 flex items-center">
          <div className="max-w-xl">
            <span className="text-4xl mb-4 block">🎉</span>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
              Event Food
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Find leftover food from campus events and club meetings before it goes to waste.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: '📣', title: 'Real-Time Alerts', desc: 'Get notified the moment leftover food from a campus event is posted — first come, first served.' },
              { icon: '🗺️', title: 'Campus-Wide Coverage', desc: 'From student club meetings to department seminars, all event food listings are in one place.' },
              { icon: '⚡', title: 'Quick Claim', desc: 'Claim your share in one tap. The AI assistant can even monitor events for you and alert you automatically.' },
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
              <li>Event organizers post leftover food listings after (or during) their events.</li>
              <li>You get a notification based on your preferences and location on campus.</li>
              <li>Claim your portion before it runs out — no reservation needed for most events.</li>
              <li>Head to the pickup location and enjoy free food that would have gone to waste.</li>
            </ol>
          </div>

          <div className="text-center">
            <p className="text-gray-500 mb-4">Never miss free food on campus again.</p>
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
