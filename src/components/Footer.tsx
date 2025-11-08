export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-gray-600 text-sm">
            © 2025 Codex Collective. All rights reserved.
          </p>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <a
              href="#about"
              className="text-gray-600 hover:text-teal-600 text-sm font-medium transition-colors focus:outline-none focus:underline"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-teal-600 text-sm font-medium transition-colors focus:outline-none focus:underline"
            >
              Contact
            </a>
            <a
              href="#privacy"
              className="text-gray-600 hover:text-teal-600 text-sm font-medium transition-colors focus:outline-none focus:underline"
            >
              Privacy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
