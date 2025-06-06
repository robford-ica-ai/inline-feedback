"""Tests for medical materials ontology functionality."""

import json
import re
from typing import Dict, List, Any

import pytest


class TestMedicalMaterialsOntology:
    """Test suite for medical materials ontology."""

    @pytest.fixture
    def sample_text_with_materials(self) -> str:
        """Sample text containing medical materials."""
        return """
        The titanium implant showed excellent biocompatibility.
        PEEK was used for the spinal fusion cage due to its radiolucency.
        The nitinol stent demonstrated superelastic properties.
        Hydroxyapatite coating promoted osseointegration.
        """

    @pytest.fixture
    def expected_materials(self) -> List[str]:
        """Expected materials to be detected."""
        return ['titanium', 'peek', 'nitinol', 'hydroxyapatite']

    @pytest.fixture
    def sample_ontology(self) -> Dict[str, Dict[str, Any]]:
        """Sample medical materials ontology."""
        return {
            "titanium": {
                "regex": r"\b(titanium|Ti-6Al-4V|Grade\s+\d+\s+titanium)\b",
                "category": "metal",
                "properties": {
                    "density": "4.51 g/cm³",
                    "biocompatibility": "excellent"
                },
                "medicalUses": ["dental implants", "joint replacements"],
                "advantages": ["high strength", "corrosion resistant"],
                "limitations": ["high cost"],
                "fdaClass": "Class II/III"
            },
            "PEEK": {
                "regex": r"\b(PEEK|polyetheretherketone|poly\s*ether\s*ether\s*ketone)\b",
                "category": "polymer",
                "properties": {
                    "density": "1.32 g/cm³",
                    "biocompatibility": "excellent"
                },
                "medicalUses": ["spinal implants", "orthopedic devices"],
                "advantages": ["radiolucent", "biocompatible"],
                "limitations": ["limited wear resistance"],
                "fdaClass": "Class II"
            }
        }

    def test_titanium_detection_regex(self, sample_text_with_materials: str) -> None:
        """Test titanium material detection using regex patterns."""
        titanium_pattern = r"\b(titanium|Ti-6Al-4V|Grade\s+\d+\s+titanium)\b"
        
        matches = re.findall(titanium_pattern, sample_text_with_materials, re.IGNORECASE)
        assert len(matches) > 0
        assert "titanium" in matches[0].lower()

    def test_peek_detection_regex(self) -> None:
        """Test PEEK material detection."""
        peek_text = "The PEEK implant and polyetheretherketone material"
        peek_pattern = r"\b(PEEK|polyetheretherketone|poly\s*ether\s*ether\s*ketone)\b"
        
        matches = re.findall(peek_pattern, peek_text, re.IGNORECASE)
        assert len(matches) >= 1
        assert any("PEEK" in match or "polyether" in match for match in matches)

    def test_material_properties_structure(self, sample_ontology: Dict[str, Dict[str, Any]]) -> None:
        """Test that material objects have required properties."""
        expected_properties = [
            'regex',
            'category', 
            'properties',
            'medicalUses',
            'advantages',
            'limitations',
            'fdaClass'
        ]
        
        for material_name, material_data in sample_ontology.items():
            for prop in expected_properties:
                assert prop in material_data, f"Missing {prop} in {material_name}"

    def test_material_categories(self, sample_ontology: Dict[str, Dict[str, Any]]) -> None:
        """Test material categorization."""
        expected_categories = ['metal', 'polymer', 'ceramic', 'shape-memory alloy']
        
        found_categories = set()
        for material_data in sample_ontology.values():
            found_categories.add(material_data['category'])
        
        # Check that we have some valid categories
        assert len(found_categories) > 0
        for category in found_categories:
            assert category in expected_categories

    def test_medical_uses_coverage(self, sample_ontology: Dict[str, Dict[str, Any]]) -> None:
        """Test that materials cover major medical applications."""
        all_uses = set()
        for material_data in sample_ontology.values():
            all_uses.update(material_data['medicalUses'])
        
        # Should have diverse medical applications
        assert len(all_uses) >= 3
        
        # Check for common medical applications
        common_uses = ['implants', 'dental', 'orthopedic', 'spinal']
        found_common = any(
            any(common in use.lower() for common in common_uses)
            for use in all_uses
        )
        assert found_common

    def test_regex_pattern_validity(self, sample_ontology: Dict[str, Dict[str, Any]]) -> None:
        """Test that regex patterns are valid."""
        for material_name, material_data in sample_ontology.items():
            pattern = material_data['regex']
            
            # Test that pattern compiles
            try:
                compiled_pattern = re.compile(pattern, re.IGNORECASE)
                assert compiled_pattern is not None
            except re.error:
                pytest.fail(f"Invalid regex pattern for {material_name}: {pattern}")

    def test_material_detection_in_text(self, sample_text_with_materials: str, sample_ontology: Dict[str, Dict[str, Any]]) -> None:
        """Test material detection in sample text."""
        detected_materials = []
        
        for material_name, material_data in sample_ontology.items():
            pattern = material_data['regex']
            matches = re.findall(pattern, sample_text_with_materials, re.IGNORECASE)
            if matches:
                detected_materials.append(material_name.lower())
        
        # Should detect at least some materials
        assert len(detected_materials) > 0
        
        # Should detect titanium and PEEK from sample text
        assert 'titanium' in detected_materials
        assert any('peek' in mat.lower() for mat in detected_materials)


class TestOntologyPerformance:
    """Performance tests for ontology operations."""

    def test_regex_performance(self) -> None:
        """Test regex matching performance on large text."""
        # Simulate large document with materials
        large_text = " ".join([
            "titanium PEEK nitinol cobalt-chrome stainless steel" 
            for _ in range(100)
        ])
        
        # Test that processing doesn't take too long
        import time
        start_time = time.time()
        
        # Simulate material detection
        materials_found = []
        test_patterns = [
            r'\btitanium\b',
            r'\bPEEK\b', 
            r'\bnitinol\b'
        ]
        
        for pattern in test_patterns:
            matches = re.findall(pattern, large_text, re.IGNORECASE)
            if matches:
                materials_found.extend(matches)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Should process quickly (< 0.1 second for test)
        assert processing_time < 0.1
        assert len(materials_found) > 0

    def test_ontology_data_structure(self) -> None:
        """Test ontology data structure efficiency."""
        # Mock ontology data structure
        mock_ontology = {
            f"material_{i}": {
                "regex": f"\\bmaterial_{i}\\b",
                "category": "test",
                "properties": {f"prop_{j}": f"value_{j}" for j in range(5)},
                "medicalUses": [f"use_{j}" for j in range(3)],
                "advantages": [f"advantage_{j}" for j in range(2)]
            }
            for i in range(50)  # 50 materials
        }
        
        # Verify data structure is reasonable
        assert len(mock_ontology) == 50
        
        # Test that all materials have required structure
        for material_data in mock_ontology.values():
            assert "regex" in material_data
            assert "category" in material_data
            assert "properties" in material_data
            assert isinstance(material_data["medicalUses"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 