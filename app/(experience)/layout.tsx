export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 h-dvh w-full overflow-hidden bg-black">
      {children}
    </div>
  )
}
