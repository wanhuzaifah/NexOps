export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
              <span className="text-brand-navy font-bold text-lg">FG</span>
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg leading-none">NexOps</p>
              <p className="text-brand-gold text-xs leading-none">FG Inspection</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-3">
            Fazmi Group Sdn Bhd Operations Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
