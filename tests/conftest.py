"""Test configuration for inline-feedback extension."""

from pathlib import Path
from typing import Any

import pytest


@pytest.fixture
def project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).parent.parent


@pytest.fixture
def src_directory(project_root: Path) -> Path:
    """Get the src directory."""
    return project_root / "src"


@pytest.fixture
def test_files_directory() -> Path:
    """Get the test fixtures directory."""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_manifest() -> dict[str, Any]:
    """Sample manifest.json structure for testing."""
    return {
        "manifest_version": 3,
        "name": "Inline Feedback",
        "version": "1.0.0",
        "permissions": ["activeTab", "storage", "scripting"],
        "content_scripts": [{"matches": ["<all_urls>"], "js": ["content.js"]}],
        "background": {"service_worker": "background.js"},
        "action": {"default_popup": "popup.html"},
    }


@pytest.fixture
def sample_claude_response() -> dict[str, Any]:
    """Sample Claude API response for testing."""
    return {
        "content": [{"text": "Medical device", "type": "text"}],
        "id": "msg_test123",
        "model": "claude-3-sonnet-20240229",
        "role": "assistant",
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "type": "message",
        "usage": {"input_tokens": 10, "output_tokens": 5},
    }


@pytest.fixture
def sample_medical_text() -> str:
    """Sample medical text in Japanese for testing."""
    return "医療機器は患者の安全を確保するため、厳格な品質管理が必要です。"


@pytest.fixture
def sample_medical_materials() -> dict[str, dict[str, Any]]:
    """Sample medical materials data for testing."""
    return {
        "titanium": {
            "name": "Titanium",
            "description": "Biocompatible metal commonly used in implants",
            "uses": ["orthopedic implants", "dental implants"],
            "properties": ["biocompatible", "corrosion resistant"],
        },
        "PEEK": {
            "name": "Polyetheretherketone",
            "description": "High-performance thermoplastic polymer",
            "uses": ["spinal implants", "orthopedic devices"],
            "properties": ["radiolucent", "biocompatible"],
        },
    }
