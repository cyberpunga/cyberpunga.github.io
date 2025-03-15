export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-fuchsia-500 animate-spin"></div>
        <div
          className="h-16 w-16 rounded-full border-r-2 border-l-2 border-cyan-400 animate-spin absolute top-0 left-0"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
      </div>
    </div>
  )
}

