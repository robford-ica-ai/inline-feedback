"""
Tests for Enhanced Medical Ontology System
"""
import os
import sys

import pytest

# Add src directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_enhanced_ontology_structure():
    """Test that enhanced ontology has expected structure"""
    # Since we can't execute JS in Python, test file content structure
    with open('src/ontology/enhanced-medical-ontology.js') as f:
        content = f.read()

    # The script should define the class
    assert 'class EnhancedMedicalOntology' in content

def test_research_evidence_structure():
    """Test that research evidence database has expected structure"""
    # Since we can't execute JS in Python, test file content structure
    with open('src/ontology/research-evidence-db.js') as f:
        content = f.read()

    # The script should define the class
    assert 'class ResearchEvidenceDatabase' in content

def test_biomaterials_data_structure():
    """Test biomaterials data has research evidence"""
    # Since we can't easily execute JS in Python, we'll do a text-based test
    with open('src/ontology/enhanced-medical-ontology.js') as f:
        content = f.read()

    # Check for key components
    assert 'researchEvidence' in content
    assert 'pmidReferences' in content
    assert 'evidenceLevel' in content
    assert 'biologicalEffects' in content
    assert 'fdaClassification' in content
    assert 'isoStandards' in content

def test_evidence_database_structure():
    """Test evidence database has PMID references"""
    with open('src/ontology/research-evidence-db.js') as f:
        content = f.read()

    # Check for key components
    assert 'pmid' in content
    assert 'studyType' in content
    assert 'clinical' in content
    assert 'laboratory' in content
    assert 'evidenceLevel' in content
    assert 'biocompatibilityFindings' in content

def test_ontology_file_exists():
    """Test that enhanced ontology file exists"""
    assert os.path.exists('src/ontology/enhanced-medical-ontology.js')

def test_evidence_db_file_exists():
    """Test that research evidence database file exists"""
    assert os.path.exists('src/ontology/research-evidence-db.js')

def test_manifest_includes_files():
    """Test that manifest.json includes new ontology files"""
    with open('src/manifest.json') as f:
        manifest_content = f.read()

    assert 'enhanced-medical-ontology.js' in manifest_content
    assert 'research-evidence-db.js' in manifest_content

def test_ontology_highlighter_updated():
    """Test that ontology highlighter supports enhanced ontology"""
    with open('src/content/ontology-highlighter.js') as f:
        content = f.read()

    # Check for enhanced ontology integration
    assert 'EnhancedMedicalOntology' in content
    assert 'ResearchEvidenceDatabase' in content
    assert 'getBiomaterials' in content
    assert 'evidenceLevel' in content

def test_materials_have_evidence():
    """Test that materials in enhanced ontology have research evidence"""
    with open('src/ontology/enhanced-medical-ontology.js') as f:
        content = f.read()

    # Test that titanium has comprehensive data
    assert 'titanium:' in content
    assert 'successRate:' in content
    assert 'studyCount:' in content
    assert 'contraindications:' in content
    assert 'adverseEvents:' in content

def test_pmid_references_format():
    """Test that PMID references are properly formatted"""
    with open('src/ontology/research-evidence-db.js') as f:
        content = f.read()

    # Check for proper PMID format (8-digit numbers)
    import re
    pmid_pattern = r"'(\d{8})'"
    pmids = re.findall(pmid_pattern, content)

    # Should find multiple PMIDs
    assert len(pmids) >= 4

    # All PMIDs should be 8 digits
    for pmid in pmids:
        assert len(pmid) == 8
        assert pmid.isdigit()

def test_clinical_guidance_system():
    """Test that clinical guidance methods are present"""
    with open('src/ontology/enhanced-medical-ontology.js') as f:
        content = f.read()

    # Check for clinical decision support methods
    assert 'getClinicalGuidance' in content
    assert 'getMonitoringRequirements' in content
    assert 'getFollowUpProtocol' in content
    assert 'generateEvidenceBasedExplanation' in content

def test_evidence_quality_assessment():
    """Test that evidence quality assessment is implemented"""
    with open('src/ontology/research-evidence-db.js') as f:
        content = f.read()

    # Check for evidence quality methods
    assert 'assessEvidenceQuality' in content
    assert 'qualityScore' in content
    assert 'qualityLevel' in content
    assert 'recommendation' in content

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
