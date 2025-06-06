# Inline Feedback

AI-powered Chrome extension providing intelligent inline feedback with medical materials ontology and real-time translation capabilities.

## Features

🤖 **Claude AI Integration** - Powered by Anthropic's Claude for intelligent text analysis  
🔬 **Medical Materials Ontology** - Automatic recognition and highlighting of medical materials (titanium, PEEK, nitinol, etc.)  
🌐 **Real-time Translation** - Instant Japanese to English translation  
📝 **Smart Annotations** - Context-aware explanations and suggestions  
🎯 **PDF Support** - Works seamlessly with PDFs in any browser  
⚡ **Offline-first** - Local ontology database with optional AI enhancement  

## Quick Start

### Installation

1. **Download the latest release** from [GitHub Releases](releases)
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (top right toggle)
4. **Click "Load unpacked"** and select the extension folder
5. **Get your Claude API key** from [console.anthropic.com](https://console.anthropic.com)
6. **Configure the extension** by clicking the extension icon

### Usage

- **Select text** → Get instant explanations and translations
- **Hover over medical terms** → See material properties and uses
- **Keyboard shortcuts:**
  - `Cmd/Ctrl + Shift + T` - Quick translate
  - `Cmd/Ctrl + Shift + E` - Explain concept

## Development

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.11+** and **uv**
- **Chrome** browser for testing

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/inline-feedback.git
cd inline-feedback

# Install dependencies
npm install
uv venv && source .venv/bin/activate
uv pip install -e ".[dev]"

# Build the extension
npm run build

# Start development with hot reload
npm run dev
```

### Development Workflow

```bash
# Development
npm run dev          # Start development build with watch
npm run test         # Run all tests
npm run lint         # Lint all code
npm run format       # Format all code

# Production
npm run build        # Production build
npm run package      # Create distribution package
npm run release      # Full release process
```

### Project Structure

```
inline-feedback/
├── src/                    # Source code
│   ├── background/         # Service worker and API handlers
│   ├── content/           # Content scripts and UI components
│   ├── popup/             # Extension popup interface
│   ├── ontology/          # Medical materials database
│   └── styles/            # CSS styling
├── tests/                 # Test suite
├── scripts/               # Build and utility scripts
└── docs/                  # Documentation
```

## Architecture

The extension follows a modular architecture with clear separation of concerns:

### Core Components

- **Content Script** - Main orchestrator, handles page activation and component lifecycle
- **Ontology Highlighter** - Scans and highlights medical terms using regex patterns
- **UI Feedback** - Modern popup system for displaying AI responses
- **PDF Extractor** - Extracts text from various PDF formats
- **Background Service** - Handles Claude API calls and storage management

### Medical Ontology

Built-in database includes:

- **Metals**: Titanium alloys, stainless steel, cobalt-chrome
- **Polymers**: PEEK, UHMWPE, PMMA
- **Ceramics**: Alumina, zirconia, hydroxyapatite
- **Composites**: Carbon fiber, glass fiber reinforced materials
- **Smart Materials**: Nitinol, shape-memory alloys

Each material includes:
- Chemical composition and properties
- Medical applications and FDA classifications
- ASTM standards and biocompatibility data
- Safety considerations and contraindications

## Configuration

### Extension Settings

Access via extension popup:

- **Claude API Key** - Your Anthropic API key
- **Model Selection** - Choose between Claude 3 models
- **Auto-translate** - Enable hover translation
- **Ontology Mode** - Toggle medical term highlighting
- **Debug Mode** - Enable verbose logging

### Environment Variables

```bash
# Required for Chrome Web Store deployment
CHROME_WEB_STORE_CLIENT_ID=your_client_id
CHROME_WEB_STORE_CLIENT_SECRET=your_client_secret
CHROME_WEB_STORE_REFRESH_TOKEN=your_refresh_token
```

## Testing

### Unit Tests

```bash
# Navigate to project directory first!
cd /Users/robertford/Repos/inline-feedback

# Run all tests (simple)
npm test

# Run all tests (verbose with test names)
uv run pytest tests/ -v

# Run specific test file
uv run pytest tests/test_extension.py -v

# Run specific test by name
uv run pytest tests/test_extension.py::TestExtensionIntegration::test_manifest_validation -v

# Run with coverage
uv run pytest tests/ --cov=src --cov-report=html

```

### Integration Tests

```bash
# Run integration tests (requires Chrome)
npm run test

# Test specific functionality
uv run pytest tests/test_extension.py -v
```

### Manual Testing

```bash
# Build and load extension in Chrome
npm run build
# Then load unpacked extension in chrome://extensions/

# Test with sample PDFs
open tests/sample-pdfs/medical-materials.pdf
```

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the code style guidelines (automatically enforced by pre-commit hooks)
4. **Add tests** for new functionality
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Code Style

This project uses:
- **Black** for Python formatting
- **Ruff** for Python linting
- **ESLint** for JavaScript linting
- **Prettier** for JavaScript formatting

All formatting is automatically applied on commit via pre-commit hooks.

## Deployment

### Chrome Web Store

Automated deployment via GitHub Actions on release:

```bash
# Create a new release
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will:
# 1. Run all tests
# 2. Build the extension
# 3. Create release artifacts
# 4. Deploy to Chrome Web Store (if configured)
```

### Manual Distribution

```bash
# Package for distribution
npm run package

# Creates: packages/inline-feedback-v1.0.0.zip
# Upload to Chrome Developer Dashboard manually
```

## Privacy & Security

- **Local Processing** - Ontology matching happens locally in your browser
- **API Calls** - Claude API calls only when you explicitly request them
- **No Tracking** - No analytics, user tracking, or data collection
- **Secure Storage** - API keys encrypted in Chrome's secure storage
- **Open Source** - Full source code available for security review

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Anthropic** for the Claude API
- **Medical Materials Database** sourced from FDA and ASTM standards
- **PDF.js** for PDF text extraction capabilities
- **Chrome Extensions API** for the extension framework

## Support

- **Issues**: [GitHub Issues](issues)
- **Discussions**: [GitHub Discussions](discussions)
- **Documentation**: [docs/](docs/)

---

**Note**: This extension requires a Claude API key from Anthropic. Free tier includes generous usage limits for personal use.