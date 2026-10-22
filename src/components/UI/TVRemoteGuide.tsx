export function TVRemoteGuide() {
  return (
    <footer className="wb-tv-guide" aria-label="Navigation Controls Legend">
      <div className="wb-tv-guide-inner">
        <div className="wb-key-item">
          <kbd className="wb-key">▲</kbd>
          <kbd className="wb-key">▼</kbd>
          <kbd className="wb-key">◄</kbd>
          <kbd className="wb-key">►</kbd>
          <span className="wb-key-desc">D-PAD / ARROWS NAVIGATE</span>
        </div>

        <div className="wb-key-divider" aria-hidden="true">•</div>

        <div className="wb-key-item">
          <kbd className="wb-key wb-key-wide">ENTER / SELECT</kbd>
          <span className="wb-key-desc">CONFIRM</span>
        </div>

        <div className="wb-key-divider" aria-hidden="true">•</div>

        <div className="wb-key-item">
          <kbd className="wb-key">ESC / BACK</kbd>
          <span className="wb-key-desc">DISMISS</span>
        </div>
      </div>
    </footer>
  )
}
