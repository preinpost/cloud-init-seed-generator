import CloudInitForm from './components/CloudInitForm'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
            <div className="text-5xl">☁️</div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Cloud-Init ISO Generator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Generate ISO files for cloud-init configuration with ease. Configure your cloud instances with custom user data, metadata, and network settings.
          </p>
        </header>

        <main className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10">
          <CloudInitForm />
        </main>

        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>@preinpost</p>
        </footer>
      </div>
    </div>
  )
}

export default App
