"""
Tests for Phase 2 ProjectDebbie Integration System
"""
import os
import sys

import pytest

# Add src directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_debbie_api_client_exists():
    """Test that DEBBIE API client file exists"""
    assert os.path.exists('src/debbie-integration/debbie-api-client.js')

def test_debbie_api_client_structure():
    """Test DEBBIE API client has expected structure"""
    with open('src/debbie-integration/debbie-api-client.js') as f:
        content = f.read()

    # Check for core API methods
    assert 'class DebbieApiClient' in content
    assert 'searchMaterial' in content
    assert 'getTermFrequencyOverTime' in content
    assert 'getTopAssociatedTerms' in content
    assert 'getNetworkRelationships' in content

    # Check for real DEBBIE endpoints
    assert 'https://debbie.bsc.es/search/api/v1' in content
    assert 'searchWithEvidenceValidation' in content

def test_debbie_api_annotation_categories():
    """Test that DEBBIE API includes real annotation categories"""
    with open('src/debbie-integration/debbie-api-client.js') as f:
        content = f.read()

    # Check for real DEBBIE categories from documentation
    required_categories = [
        'Biomaterial', 'MedicalApplication', 'EffectOnBiologicalSystem',
        'AdverseEffects', 'AssociatedBiologicalProcess', 'ManufacturedObject',
        'Structure', 'Cell', 'Tissue', 'MaterialProcessing', 'ResearchTechnique'
    ]

    for category in required_categories:
        assert category in content

def test_owl2dict_converter_exists():
    """Test that OWL2DICT converter file exists"""
    assert os.path.exists('src/debbie-integration/owl2dict-converter.js')

def test_owl2dict_converter_structure():
    """Test OWL2DICT converter has expected structure"""
    with open('src/debbie-integration/owl2dict-converter.js') as f:
        content = f.read()

    # Check for core converter methods
    assert 'class Owl2DictConverter' in content
    assert 'loadDebOntology' in content
    assert 'convertOwlToDict' in content
    assert 'extractClasses' in content
    assert 'extractProperties' in content

    # Check for real DEB ontology URL
    assert (
        'https://raw.githubusercontent.com/ProjectDebbie/Ontology_DEB/master/DEB_ont.owl'
        in content
    )

def test_owl2dict_ontology_processing():
    """Test OWL2DICT has proper ontology processing methods"""
    with open('src/debbie-integration/owl2dict-converter.js') as f:
        content = f.read()

    # Check for ontology processing capabilities
    assert 'buildHierarchies' in content
    assert 'extractLabel' in content
    assert 'extractComment' in content
    assert 'extractSynonyms' in content
    assert 'searchClasses' in content

def test_gold_standard_pmid_loader_exists():
    """Test that gold standard PMID loader file exists"""
    assert os.path.exists('src/debbie-integration/gold-standard-pmid-loader.js')

def test_gold_standard_pmid_loader_structure():
    """Test gold standard PMID loader has expected structure"""
    with open('src/debbie-integration/gold-standard-pmid-loader.js') as f:
        content = f.read()

    # Check for core loader methods
    assert 'class GoldStandardPmidLoader' in content
    assert 'loadAllGoldStandardSets' in content
    assert 'loadGoldStandardSet' in content
    assert 'parsePmidFile' in content
    assert 'validatePmidSet' in content

def test_gold_standard_pmid_files():
    """Test that real ProjectDebbie PMID file URLs are referenced"""
    with open('src/debbie-integration/gold-standard-pmid-loader.js') as f:
        content = f.read()

    # Check for real gold standard files
    assert 'clinical_gs_1092.txt' in content
    assert 'laboratory_gs_1213.txt' in content
    assert 'gs_original_1230.txt' in content
    assert (
        'https://raw.githubusercontent.com/ProjectDebbie/gold_standard_set' in content
    )

def test_gold_standard_pmid_counts():
    """Test that expected PMID counts are configured"""
    with open('src/debbie-integration/gold-standard-pmid-loader.js') as f:
        content = f.read()

    # Check for expected study counts
    assert 'count: 1092' in content  # Clinical studies
    assert 'count: 1213' in content  # Laboratory studies
    assert 'count: 1230' in content  # Original gold standard

def test_project_debbie_coordinator_exists():
    """Test that ProjectDebbie coordinator file exists"""
    assert os.path.exists('src/debbie-integration/project-debbie-coordinator.js')

def test_project_debbie_coordinator_structure():
    """Test ProjectDebbie coordinator has expected structure"""
    with open('src/debbie-integration/project-debbie-coordinator.js') as f:
        content = f.read()

    # Check for core coordinator methods
    assert 'class ProjectDebbieCoordinator' in content
    assert 'initialize' in content
    assert 'searchMaterial' in content
    assert 'performClinicalValidation' in content
    assert 'generateEvidenceSummary' in content

def test_clinical_validation_framework():
    """Test that clinical validation framework is implemented"""
    with open('src/debbie-integration/project-debbie-coordinator.js') as f:
        content = f.read()

    # Check for clinical validation components
    assert 'validationFramework' in content
    assert 'evidenceLevels' in content
    assert 'clinicalRecommendation' in content
    assert 'performClinicalValidation' in content

def test_integration_analysis():
    """Test that integration analysis methods are present"""
    with open('src/debbie-integration/project-debbie-coordinator.js') as f:
        content = f.read()

    # Check for integration analysis
    assert 'analyzeIntegratedResults' in content
    assert 'convergence' in content
    assert 'dataAvailability' in content
    assert 'confidence' in content

def test_manifest_includes_debbie_integration():
    """Test that manifest.json includes ProjectDebbie integration files"""
    with open('src/manifest.json') as f:
        manifest_content = f.read()

    # Check for all ProjectDebbie integration files
    assert 'debbie-integration/debbie-api-client.js' in manifest_content
    assert 'debbie-integration/owl2dict-converter.js' in manifest_content
    assert 'debbie-integration/gold-standard-pmid-loader.js' in manifest_content
    assert 'debbie-integration/project-debbie-coordinator.js' in manifest_content

    # Check for web accessible resources
    assert 'debbie-integration/*' in manifest_content

def test_eu_horizon_2020_attribution():
    """Test that EU Horizon 2020 attribution is present"""
    integration_files = [
        'src/debbie-integration/debbie-api-client.js',
        'src/debbie-integration/owl2dict-converter.js',
        'src/debbie-integration/gold-standard-pmid-loader.js',
        'src/debbie-integration/project-debbie-coordinator.js'
    ]

    for file_path in integration_files:
        with open(file_path) as f:
            content = f.read()

        # Check for proper attribution
        assert 'ProjectDebbie' in content or 'EU Horizon 2020' in content

def test_pmid_validation_regex():
    """Test that PMID validation regex is properly formatted"""
    with open('src/debbie-integration/gold-standard-pmid-loader.js') as f:
        content = f.read()

    # Check for PMID validation regex (7-9 digits)
    assert r'/^\d{7,9}$/' in content or r'/\\d{8,}/' in content

def test_error_handling_and_fallbacks():
    """Test that error handling and fallback mechanisms are implemented"""
    integration_files = [
        'src/debbie-integration/debbie-api-client.js',
        'src/debbie-integration/owl2dict-converter.js',
        'src/debbie-integration/gold-standard-pmid-loader.js'
    ]

    for file_path in integration_files:
        with open(file_path) as f:
            content = f.read()

        # Check for error handling
        assert 'try {' in content and 'catch' in content
        assert 'getFallback' in content or 'fallback' in content

def test_caching_mechanisms():
    """Test that caching mechanisms are implemented"""
    integration_files = [
        'src/debbie-integration/debbie-api-client.js',
        'src/debbie-integration/owl2dict-converter.js',
        'src/debbie-integration/gold-standard-pmid-loader.js'
    ]

    for file_path in integration_files:
        with open(file_path) as f:
            content = f.read()

        # Check for caching implementation
        assert 'cache' in content
        assert 'cacheTimeout' in content or 'timestamp' in content

def test_evidence_quality_assessment():
    """Test that evidence quality assessment is implemented"""
    with open('src/debbie-integration/debbie-api-client.js') as f:
        content = f.read()

    # Check for evidence quality methods
    assert 'assessEvidenceQuality' in content
    assert 'score:' in content or 'qualityScore' in content
    assert 'evidenceLevel' in content

def test_research_activity_calculation():
    """Test that research activity calculation is implemented"""
    with open('src/debbie-integration/debbie-api-client.js') as f:
        content = f.read()

    # Check for research activity levels
    activity_levels = ['very_high', 'high', 'moderate', 'emerging', 'limited']
    for level in activity_levels:
        assert level in content

def test_ontology_categorization():
    """Test that ontology categorization system is implemented"""
    with open('src/debbie-integration/owl2dict-converter.js') as f:
        content = f.read()

    # Check for categorization
    assert 'categorizeClass' in content
    categories = [
        'biomaterial', 'device', 'process', 'property', 'effect', 'application'
    ]
    for category in categories:
        assert category in content

def test_global_instances():
    """Test that global instances are created for all integration components"""
    integration_files = [
        'src/debbie-integration/debbie-api-client.js',
        'src/debbie-integration/owl2dict-converter.js',
        'src/debbie-integration/gold-standard-pmid-loader.js',
        'src/debbie-integration/project-debbie-coordinator.js'
    ]

    expected_globals = [
        'window.DebbieApiClient',
        'window.Owl2DictConverter',
        'window.GoldStandardPmidLoader',
        'window.ProjectDebbieCoordinator'
    ]

    for file_path, global_name in zip(
        integration_files, expected_globals, strict=False
    ):
        with open(file_path) as f:
            content = f.read()
        assert global_name in content

def test_module_exports():
    """Test that module exports are configured for Node.js compatibility"""
    integration_files = [
        'src/debbie-integration/debbie-api-client.js',
        'src/debbie-integration/owl2dict-converter.js',
        'src/debbie-integration/gold-standard-pmid-loader.js',
        'src/debbie-integration/project-debbie-coordinator.js'
    ]

    for file_path in integration_files:
        with open(file_path) as f:
            content = f.read()

        # Check for module export compatibility
        assert 'module.exports' in content

def test_integration_system_coordination():
    """Test that integration system properly coordinates components"""
    with open('src/debbie-integration/project-debbie-coordinator.js') as f:
        content = f.read()

    # Check that coordinator references all components
    assert 'DebbieApiClient' in content
    assert 'Owl2DictConverter' in content
    assert 'GoldStandardPmidLoader' in content

    # Check for initialization coordination
    assert 'loadDebOntology' in content
    assert 'loadGoldStandardDatabase' in content
    assert 'loadAnnotationCategories' in content

def test_search_integration():
    """Test that search integration combines all data sources"""
    with open('src/debbie-integration/project-debbie-coordinator.js') as f:
        content = f.read()

    # Check for integrated search
    assert 'searchDebbieDatabase' in content
    assert 'searchDebOntology' in content
    assert 'searchGoldStandardPmids' in content
    assert 'integratedResults' in content

def test_clinical_decision_support():
    """Test that clinical decision support features are implemented"""
    with open('src/debbie-integration/project-debbie-coordinator.js') as f:
        content = f.read()

    # Check for clinical decision support
    clinical_features = [
        'clinicalValidation',
        'evidenceLevel',
        'clinicalRecommendation',
        'supportingEvidence'
    ]

    for feature in clinical_features:
        assert feature in content

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
