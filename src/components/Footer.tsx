export function Footer() {
  return (
    <footer className="parchment-bg border-t-2 border-amber-300 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50">
              Draachenmar Encyclopedia
            </h3>
            <p className="text-sm text-amber-600 dark:text-amber-50 font-serif">
              A comprehensive guide to the realm and its inhabitants
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="text-sm text-amber-600 dark:text-amber-50">
              <span className="font-semibold">Campaign World</span> • Created with care
            </div>
            <div className="flex items-center space-x-4 text-xs text-amber-500 dark:text-amber-50">
              <span>📚 Campaign Guide</span>
              <span>🗺️ Interactive Maps</span>
              <span>⚔️ Adventures</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-amber-200 text-center text-xs text-amber-500 dark:text-amber-50">
          Built with React & TypeScript • Styled with Tailwind CSS
        </div>
      </div>
    </footer>
  );
}