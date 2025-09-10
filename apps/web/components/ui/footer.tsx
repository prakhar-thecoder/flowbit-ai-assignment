export default function Footer() {
    return (
      <footer className="w-full bg-white border-t bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="text-center sm:text-left">
            <p className="font-semibold">Developed by Prakhar Parikh</p>
            <p>
              <a href="mailto:prakharparikh@example.com" className="hover:underline">
                pnp14072005@gmail.com
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <a
              href="https://linkedin.com/in/prakhar-parikh"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/prakhar-thecoder"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              GitHub
            </a>
            <a
              href="https://github.com/prakhar-thecoder/flowbit-ai-assignment"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              Project Repo
            </a>
          </div>
        </div>
      </footer>
    );
  }
  