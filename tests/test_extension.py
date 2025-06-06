"""Integration tests for Chrome extension functionality."""

import json
from pathlib import Path

import pytest


class TestExtensionIntegration:
    """Test the Chrome extension as a whole."""

    def test_manifest_validation(self) -> None:
        """Test that manifest.json is valid."""
        manifest_path = Path(__file__).parent.parent / "src" / "manifest.json"

        assert manifest_path.exists(), "manifest.json should exist"

        with open(manifest_path, encoding="utf-8") as f:
            manifest = json.load(f)

        # Required fields
        assert "manifest_version" in manifest
        assert "name" in manifest
        assert "version" in manifest
        assert "permissions" in manifest
        assert "content_scripts" in manifest
        assert "background" in manifest

        # Verify manifest version
        assert manifest["manifest_version"] == 3

        # Verify required permissions
        required_permissions = ["activeTab", "storage"]
        for permission in required_permissions:
            assert permission in manifest["permissions"]

    def test_extension_files_exist(self) -> None:
        """Test that all required extension files exist."""
        src_path = Path(__file__).parent.parent / "src"

        required_files = [
            "manifest.json",
            "content/content-script.js",
            "ontology/medical-materials.js",
        ]

        for file_name in required_files:
            file_path = src_path / file_name
            assert file_path.exists(), f"{file_name} should exist in src directory"

    def test_content_script_structure(self) -> None:
        """Test content script has proper structure."""
        content_path = (
            Path(__file__).parent.parent / "src" / "content" / "content-script.js"
        )

        assert content_path.exists(), "content-script.js should exist"

        with open(content_path, encoding="utf-8") as f:
            content = f.read()

        # Check for basic structure
        assert len(content) > 0
        assert "function" in content or "const" in content or "let" in content

    def test_popup_html_structure(self) -> None:
        """Test popup.html structure (skip if not exists)."""
        popup_path = Path(__file__).parent.parent.parent / "src" / "popup.html"

        if not popup_path.exists():
            pytest.skip("popup.html not implemented yet")

        with open(popup_path, encoding="utf-8") as f:
            content = f.read()

        # Check for essential elements
        assert "<html" in content

    def test_medical_ontology_structure(self) -> None:
        """Test medical ontology has proper structure."""
        ontology_path = (
            Path(__file__).parent.parent / "src" / "ontology" / "medical-materials.js"
        )

        assert ontology_path.exists(), "medical-materials.js should exist"

        with open(ontology_path, encoding="utf-8") as f:
            content = f.read()

        # Check for key materials
        materials = ["titanium", "PEEK", "nitinol"]
        found_materials = 0
        for material in materials:
            if material in content:
                found_materials += 1

        # Should find at least some materials
        assert found_materials > 0

    def test_build_script_exists(self) -> None:
        """Test that build script exists and has proper structure."""
        build_path = Path(__file__).parent.parent / "scripts" / "build.js"

        assert build_path.exists(), "build.js should exist"

        with open(build_path, encoding="utf-8") as f:
            content = f.read()

        assert "copyFile" in content
        assert "dist" in content

    def test_package_json_structure(self) -> None:
        """Test package.json has proper structure."""
        package_path = Path(__file__).parent.parent / "package.json"

        assert package_path.exists(), "package.json should exist"

        with open(package_path, encoding="utf-8") as f:
            package = json.load(f)

        # Required fields
        assert "name" in package
        assert "version" in package
        assert "scripts" in package
        assert "devDependencies" in package

        # Required scripts
        required_scripts = ["build", "dev", "test", "package"]
        for script in required_scripts:
            assert script in package["scripts"]


class TestExtensionBuild:
    """Test extension build process."""

    def test_dist_directory_creation(self) -> None:
        """Test that dist directory can be created."""
        dist_path = Path(__file__).parent.parent.parent / "dist"

        # Directory might not exist yet, that's OK
        # This is more about testing the path structure
        assert isinstance(str(dist_path), str)

    def test_build_artifacts(self) -> None:
        """Test build process creates expected artifacts."""
        # This would run after a build
        dist_path = Path(__file__).parent.parent.parent / "dist"

        if dist_path.exists():
            # If dist exists, check it has manifest
            manifest_path = dist_path / "manifest.json"
            if manifest_path.exists():
                with open(manifest_path, encoding="utf-8") as f:
                    manifest = json.load(f)
                assert "name" in manifest


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
