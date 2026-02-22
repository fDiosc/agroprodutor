import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-background px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center rounded-lg border border-neutral-border bg-white p-8 shadow-card">
          <Image
            src="/logo.png"
            alt="MERX"
            width={80}
            height={80}
            className="mb-6"
          />
          {children}
        </div>
      </div>
    </div>
  )
}
