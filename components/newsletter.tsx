import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="container mx-auto px-4 py-20 relative">
      {/* Terminal-inspired decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-fuchsia-500 to-transparent"></div>

      <div className="max-w-3xl mx-auto text-center relative">
        <div className="inline-block mb-4 px-3 py-1 bg-zinc-900 border-l-4 border-cyan-400 font-mono text-sm">
          <span className="text-cyan-400">03.</span> NEURAL NETWORK
        </div>
        <h2 className="text-3xl font-bold font-mono mb-4">Join Our Collective</h2>
        <p className="text-zinc-400 mb-8">
          Subscribe to our neural network for exclusive content, exhibition announcements, and insights from our
          contributing artists and researchers.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
          <div className="absolute -top-6 -left-6 w-12 h-12 opacity-50">
            <div className="absolute top-0 left-0 w-px h-12 bg-cyan-400"></div>
            <div className="absolute top-0 left-0 h-px w-12 bg-cyan-400"></div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-12 h-12 opacity-50">
            <div className="absolute bottom-0 right-0 w-px h-12 bg-fuchsia-500"></div>
            <div className="absolute bottom-0 right-0 h-px w-12 bg-fuchsia-500"></div>
          </div>
          <Input
            type="email"
            placeholder="Enter your email"
            className="bg-zinc-900 border-zinc-800 focus-visible:ring-cyan-400 font-mono"
            required
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-white font-mono"
          >
            &gt; Connect
          </Button>
        </form>
        <p className="text-xs text-zinc-500 mt-4 font-mono">
          By subscribing, you agree to our Privacy Policy and consent to receive updates from NEURO/VOID.
        </p>
      </div>
    </section>
  )
}

