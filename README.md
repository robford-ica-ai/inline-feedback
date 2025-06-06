# Py Launch Blueprint: A Production-Ready Python Project Template with Integrated Best Practices

 Py Launch Blueprint is a comprehensive Python project template that eliminates setup friction by providing a pre-configured development environment with carefully selected tools for linting, formatting, and type checking. It includes an annotated CLI example and detailed documentation explaining each tool choice and configuration decision, making it an ideal starting point for professional Python projects.

## Why Choose Py Launch Blueprint?

Py Launch Blueprint eliminates the setup friction in Python projects by providing a production-ready template with carefully curated tools and best practices. Here's what makes it special:

### 🚀 Key Features

- **Zero Configuration Setup**: Get started immediately with pre-configured development tools
- **Type Safety First**: Built-in MyPy configuration and VS Code integration for robust type checking
- **Modern Development Tools**:
  - ⚡ Ruff for lightning-fast linting and formatting
  - 🎨 Black for consistent code styling
  - 🔍 Pre-commit hooks for code quality enforcement
  - 📝 Type checking with MyPy and Pylance

### 💪 Production Ready
- **Python 3.10+ Support**: Leverages modern Python features
- **Dependency Management**: Uses `uv` for fast, reliable package management
- **CI/CD Ready**: Includes GitHub Actions workflows
- **Comprehensive Testing**: Pre-configured test setup with best practices

### 🛠️ Developer Experience
- **VS Code Integration**: Curated set of recommended extensions
- **Intelligent Defaults**: Optimized settings for common development tasks
- **Clear Documentation**: Detailed explanations for all tool choices and configurations
- **Git Hooks**: Automated code quality checks before commits

### 🎯 Perfect For
- Teams wanting a standardized Python development environment
- Projects requiring maintainable, type-safe code
- Developers who value clean, consistent code style
- Anyone looking to adopt Python best practices from day one

Start your next Python project with confidence, knowing you're building on a foundation of best practices and modern development tools.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Project Structure

The project uses a simple, maintainable structure:

```
py-utils/
├── projects.py      # Main script with all functionality
├── tests/          # Test files
│   ├── __init__.py
│   ├── test_api.py
│   ├── test_config.py
│   └── test_cli.py
├── pyproject.toml  # Project and tool configuration
└── README.md      # Documentation
```

# Example CLI Tool Usage
[Example CLI: py-projects](EXAMPLECLI.md)

## Development

### Setup Development Environment

Project requires Python 3.10+ (which is also specified inside [.python-version](.python-version) file) and [uv](https://docs.astral.sh/uv/getting-started/installation/) installed.

```bash
# Create and activate a virtual environment if needed
uv venv
source .venv/bin/activate  # On Unix/macOS

# Install the package in editable mode with development dependencies
uv pip install --editable ".[dev]"

# Check the installed package
py-projects --version

# (Optional) Setup Pre-Commit Hook
uvx --with-editable . pre-commit install

# Run development tools directly (no need for 'uv pip run')
pytest
black py_launch_blueprint/
isort py_launch_blueprint/
mypy py_launch_blueprint/
ruff check py_launch_blueprint/

# Or run with our the virtual environment

# (Optional) Setup Pre-Commit Hook
uvx --with-editable . pre-commit install

# Run tests
uvx --with-editable . pytest

# Run tests with coverage
uvx --pytest-cov --with-editable . pytest --cov=py_launch_blueprint.projects --cov-report=term-missing

# Format code
uvx black py_launch_blueprint/

# Sort imports
uvx isort py_launch_blueprint/

# Run type checker
uvx  --with-editable . mypy py_launch_blueprint/

# Run linter
uvx ruff check py_launch_blueprint/

# Run command
uvx --with-editable .  --from py_launch_blueprint py-projects
```

# Notes on tool choices

## Black
- Known as "The uncompromising code formatter"

Pros:
- Zero configuration needed - enforces a consistent style with minimal choices
- Very fast performance
- Used by many major projects like Django and pytest
- Maintains compatibility with modern Python features
- Excellent integration with popular editors and CI tools

Cons:
- Limited customization options by design
- Some developers find its formatting choices too opinionated
- Line length fixed at 88 characters (though this can be changed)

## isort
- Specifically for sorting imports. Often used in combination with other formatters

Pros:
- Best-in-class for import organization
- Highly configurable
- Works well with Black and other formatters

Cons:
- Single-purpose tool (imports only)
- Can sometimes conflict with other formatters

```python

# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py38']

[tool.isort]
profile = "black"  # Makes isort compatible with Black
multi_line_output = 3
```

Python line length standards:
- 79/80: Traditional PEP 8 standard. Good for side-by-side editing but can feel restrictive.
- 88: Black's default. Modern sweet spot between readability and expressiveness. Becoming the community standard.
- 100: Google's choice. Popular in enterprise. Good for complex expressions.
- 120: Maximum reasonable length. Works on wide screens but can hurt readability.
- Recommendation: Use 88 characters (Black's default) unless your team/project has an existing standard. It offers the best balance of readability and practicality while following modern community practices.

## Ruff
Ruff is a high-performance linter and code formatter for Python. It combines multiple tools into one, offering faster performance and comprehensive functionality compared to traditional Python tools.

Pros:

- Very Fast: Written in Rust, Ruff is significantly faster than traditional linters, allowing it to process large codebases quickly.
- All-in-One Solution: Ruff incorporates checks and fixes from a variety of popular linters like Flake8, Black, isort, pydocstyle, pyupgrade, autoflake. This means less maintenance of multiple separate tools.
- Customizable: Allows users to select and ignore specific checks or enforce particular rules according to the project needs.
- Easy Integration: Works well with CI/CD pipelines, IDEs, and modern developer workflows.
Automated Fixes: Ruff can automatically correct a wide range of issues in your code.

Cons:
- Relatively New: As a newer tool, it might not yet be as widely adopted or supported in some edge cases.

## mypy
Most teams today actually run both mypy and pyright/Pylance:

- mypy in CI/pre-commit hooks for strict checking
- Pylance in VS Code for real-time development feedback

This combination provides comprehensive type checking coverage while maintaining a smooth development experience.

Let me explain the difference between `disallow_untyped_defs = false` vs `true`:

**disallow_untyped_defs = true**
```python
# This will raise an error
def process_data(data):  # Error: Function is missing type annotations
    return data + 1

# This is required instead
def process_data(data: int) -> int:
    return data + 1
```

**disallow_untyped_defs = false**
```python
# This is allowed
def process_data(data):
    return data + 1

# This is also allowed
def process_data(data: int) -> int:
    return data + 1
```

**When to use each:**

Use `true` when:
- Starting a new project
- Working on a codebase that's fully committed to type hints
- Want to ensure complete type coverage
- Have a team that's comfortable with Python type hints

Use `false` when:
- Gradually adding types to a legacy codebase
- Working with test files (common to disable for tests)
- Training team members who are new to type hints
- Need to temporarily bypass type checking for specific modules

**Best Practice Recommendation:**
Start new projects with `true` for maximum type safety. For existing projects, use `false` initially and gradually enable it as you add type hints to the codebase. Many teams set it to `false` for test files but `true` for production code.

VS Code Settings for pyright/Pylance
```json
{
    "python.analysis.typeCheckingMode": "strict",
    "python.analysis.diagnosticMode": "workspace",
    "python.analysis.autoImportCompletions": true,
    "python.analysis.importFormat": "relative",
    "python.analysis.inlayHints.functionReturnTypes": true,
    "python.analysis.inlayHints.variableTypes": true
}
```

Common Type Annotation Examples
```python
from typing import Dict, List, Optional, Tuple, Union, TypeVar, Generic

# Basic type annotations
def greet(name: str) -> str:
    return f"Hello {name}"

# Optional parameters
def fetch_user(user_id: Optional[int] = None) -> Dict[str, Union[str, int]]:
    ...

# Generic types
T = TypeVar('T')
class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: List[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()

# Type aliases
UserId = int
UserDict = Dict[UserId, Dict[str, Union[str, int]]]

# Callable types
from typing import Callable
Handler = Callable[[str, int], bool]

def process(handler: Handler) -> None:
    ...
```

## Recommended Extensions

This project comes with recommended VS Code extensions to enhance your development experience. When you open this project in VS Code, you'll be prompted to install these extensions:

- **Python** (`ms-python.python`): Essential Python language support
- **Pylance** (`ms-python.vscode-pylance`): Fast, feature-rich language support for Python
- **Black Formatter** (`ms-python.black-formatter`): Official Black formatter integration
- **Ruff** (`charliermarsh.ruff`): Fast Python linter and formatter
- **MyPy** (`matangover.mypy`): Static type checking for Python
- **Even Better TOML** (`tamasfe.even-better-toml`): Improved TOML file support
- **YAML** (`redhat.vscode-yaml`): YAML language support
- **GitLens** (`eamodio.gitlens`): Enhanced Git integration
- **Code Spell Checker** (`streetsidesoftware.code-spell-checker`): Catch common spelling mistakes

These extensions are configured to work seamlessly with the project's setup and will help maintain code quality standards. VS Code will automatically suggest installing these extensions when you open the project.

## Precommit hooks

Hooks are designed to maintain clean, consistent, and error-free code and configuration files. They save time by catching issues before they make it into your repository.

Following pre-commit hooks are used in this repo


- `check-yaml` checks if all YAML files in your repository are valid,
- `end-of-file-fixer` ensures every file in your repository ends with a single newline character,
- `trailing-whitespace` removes trailing spaces at the end of lines in your files,
- `check-toml` checks if all TOML files in your repository are valid,
- `check-added-large-files` warns when you try to add large files to the repository,
- `mypy` checks your Python code for type errors based on type annotations,
- `ruff` acts as a fast linter and formatter for Python, ensuring clean code,
- `black`formats Python code to enforce consistent and opinionated style rules across your codebase.

## Python Types Common Issues and Solutions
1. Third-party library types:
```bash
# Install type stubs for common libraries
pip install types-requests types-PyYAML types-python-dateutil
```

2. Ignoring specific lines:
```python
# mypy
reveal_type(x)  # type: ignore

# pyright
x = something()  # pyright: ignore
```

3. Type checking only specific files:
```bash
# mypy
mypy src/main.py src/utils.py

# pyright
pyright src/main.py src/utils.py
```

disallow_untyped_defs = true vs false
- Use `true` when starting new projects or working with teams experienced in type hints who want complete type coverage.
- Use `false` when adding types to legacy code, working with test files, or training developers new to type hints.

disallow_untyped_defs = true
```python
# This will raise an error
def process_data(data):  # Error: Function is missing type annotations
    return data + 1

# This is required instead
def process_data(data: int) -> int:
    return data + 1
```

disallow_untyped_defs = false
```python
# This is allowed
def process_data(data):
    return data + 1

# This is also allowed
def process_data(data: int) -> int:
    return data + 1
```

# Recommended Extensions

This project comes with recommended VS Code extensions to enhance your development experience. When you open this project in VS Code, you'll be prompted to install these extensions:

- **Python** (`ms-python.python`): Essential Python language support
- **Pylance** (`ms-python.vscode-pylance`): Fast, feature-rich language support for Python
- **Black Formatter** (`ms-python.black-formatter`): Official Black formatter integration
- **Ruff** (`charliermarsh.ruff`): Fast Python linter and formatter
- **MyPy** (`matangover.mypy`): Static type checking for Python
- **Even Better TOML** (`tamasfe.even-better-toml`): Improved TOML file support
- **YAML** (`redhat.vscode-yaml`): YAML language support
- **GitLens** (`eamodio.gitlens`): Enhanced Git integration
- **Code Spell Checker** (`streetsidesoftware.code-spell-checker`): Catch common spelling mistakes

These extensions are configured to work seamlessly with the project's setup and will help maintain code quality standards. VS Code will automatically suggest installing these extensions when you open the project.

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
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data and PDFs
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
# Run Python unit tests
npm run test:unit

# Run specific test file
uv run pytest tests/unit/test_ontology.py -v

# Run with coverage
uv run pytest tests/unit/ --cov=src --cov-report=html
```

### Integration Tests

```bash
# Run integration tests (requires Chrome)
npm run test:integration

# Test specific functionality
uv run pytest tests/integration/test_extension_flow.py -v
```

### Manual Testing

```bash
# Build and load extension in Chrome
npm run build
# Then load unpacked extension in chrome://extensions/

# Test with sample PDFs
open tests/fixtures/sample-pdfs/medical-materials.pdf
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
