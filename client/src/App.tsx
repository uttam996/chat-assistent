import { ChatWidget } from '@/features/chat/ChatWidget';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">SwiftCart</h1>
          <nav className="flex gap-6 text-sm text-slate-600">
            <span>Shop</span>
            <span>Deals</span>
            <span>Contact</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="max-w-xl">
          <p className="mb-2 text-sm font-medium text-blue-600">Free shipping above ₹999</p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
            Your favourite products, delivered fast.
          </h2>
          <p className="mb-8 text-slate-600">
            This page simulates a store website. Use the live chat widget in the bottom-right corner
            to ask our AI support agent about shipping, returns, or support hours.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white"
            >
              Shop now
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700"
            >
              View deals
            </button>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {['Electronics', 'Fashion', 'Home'].map((category) => (
            <div
              key={category}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="mb-3 h-24 rounded-lg bg-slate-100" />
              <h3 className="font-medium text-slate-900">{category}</h3>
              <p className="mt-1 text-sm text-slate-500">Browse latest arrivals</p>
            </div>
          ))}
        </section>
      </main>

      <ChatWidget />
    </div>
  );
}

export default App;
