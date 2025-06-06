/**
 * Demo: Enhanced Evidence-Based Medical Ontology System
 * Showcases research-backed biomedical assistant capabilities
 */

// Load our enhanced systems
const enhancedOntology = new EnhancedMedicalOntology();
const evidenceDB = new ResearchEvidenceDatabase();

console.log('🧬 Enhanced Medical Ontology System Demo');
console.log('========================================\n');

// Demo 1: Basic Material Information
console.log('📊 Demo 1: Enhanced Material Information');
const titanium = enhancedOntology.getBiomaterials().titanium;
console.log(`Material: ${titanium.name}`);
console.log(`Category: ${titanium.category}`);
console.log(`Success Rate: ${titanium.researchEvidence.successRate}`);
console.log(`Evidence Level: ${titanium.researchEvidence.evidenceLevel}`);
console.log(`Study Count: ${titanium.researchEvidence.studyCount}`);
console.log(`FDA Classification: ${titanium.fdaClassification}\n`);

// Demo 2: Research Evidence Integration
console.log('🔬 Demo 2: Research Evidence Integration');
const titaniumEvidence = enhancedOntology.getResearchEvidence('titanium');
console.log('Research Evidence for Titanium:');
console.log(`- Studies: ${titaniumEvidence.evidence.studyCount}`);
console.log(`- Success Rate: ${titaniumEvidence.evidence.successRate}`);
console.log(`- Contraindications: ${titaniumEvidence.evidence.contraindications.join(', ')}`);
console.log(`- Adverse Events: ${titaniumEvidence.evidence.adverseEvents.join(', ')}\n`);

// Demo 3: Evidence-Based Explanation Generation
console.log('📋 Demo 3: Evidence-Based Explanations');
const explanation = enhancedOntology.generateEvidenceBasedExplanation('titanium');
console.log('Generated Explanation:');
console.log(explanation);
console.log('\n');

// Demo 4: Clinical Decision Support
console.log('⚕️ Demo 4: Clinical Decision Support');
const clinicalGuidance = enhancedOntology.getClinicalGuidance('titanium', 'dental implants');
console.log('Clinical Guidance for Titanium Dental Implants:');
console.log(`- Recommendation: ${clinicalGuidance.recommendation}`);
console.log(`- Success Rate: ${clinicalGuidance.successRate}`);
console.log(`- Monitoring: ${clinicalGuidance.monitoring.join(', ')}`);
console.log(`- Follow-up: ${clinicalGuidance.followUp}\n`);

// Demo 5: PMID Research Database
console.log('📚 Demo 5: Research Database Integration');
const pmidStudy = evidenceDB.getStudyByPMID('12345678');
console.log(`Study: ${pmidStudy.title}`);
console.log(`Authors: ${pmidStudy.authors.join(', ')}`);
console.log(`Journal: ${pmidStudy.journal} (${pmidStudy.year})`);
console.log(`Study Type: ${pmidStudy.studyType}`);
console.log(`Sample Size: ${pmidStudy.studyDesign.sampleSize}`);
console.log(`Success Rate: ${pmidStudy.outcomes.successRate}\n`);

// Demo 6: Evidence Quality Assessment
console.log('📈 Demo 6: Evidence Quality Assessment');
const qualityAssessment = evidenceDB.assessEvidenceQuality('12345678');
console.log('Quality Assessment:');
console.log(`- PMID: ${qualityAssessment.pmid}`);
console.log(`- Quality Score: ${qualityAssessment.qualityScore}/8`);
console.log(`- Quality Level: ${qualityAssessment.qualityLevel}`);
console.log(`- Factors: ${qualityAssessment.factors.join(', ')}`);
console.log(`- Recommendation: ${qualityAssessment.recommendation}\n`);

// Demo 7: Material Search and Discovery
console.log('🔍 Demo 7: Material Search and Discovery');
const searchResults = evidenceDB.searchStudies('titanium biocompatibility');
console.log(`Found ${searchResults.length} relevant studies:`);
searchResults.slice(0, 3).forEach((study, index) => {
    console.log(`${index + 1}. ${study.title} (${study.year}) - Relevance: ${(study.relevance * 100).toFixed(1)}%`);
});
console.log('\n');

// Demo 8: Evidence Summary Generation
console.log('📊 Demo 8: Evidence Summary Generation');
const evidenceSummary = evidenceDB.generateEvidenceSummary('titanium');
console.log('Evidence Summary for Titanium:');
console.log(`- Total Studies: ${evidenceSummary.totalStudies}`);
console.log(`- Clinical Studies: ${evidenceSummary.clinicalStudies}`);
console.log(`- Laboratory Studies: ${evidenceSummary.laboratoryStudies}`);
console.log(`- Total Patients: ${evidenceSummary.totalPatients}`);
console.log(`- Latest Study: ${evidenceSummary.latestStudy}`);
console.log(`- High Evidence: ${evidenceSummary.evidenceLevels.high} studies\n`);

// Demo 9: Comparative Analysis
console.log('⚖️ Demo 9: Comparative Material Analysis');
const peekData = enhancedOntology.getBiomaterials().peek;
const nitinolData = enhancedOntology.getBiomaterials().nitinol;

console.log('Success Rate Comparison:');
console.log(`- Titanium: ${titanium.researchEvidence.successRate}`);
console.log(`- PEEK: ${peekData.researchEvidence.successRate}`);
console.log(`- Nitinol: ${nitinolData.researchEvidence.successRate}`);

console.log('\nEvidence Quality Comparison:');
console.log(`- Titanium: ${titanium.researchEvidence.studyCount} studies`);
console.log(`- PEEK: ${peekData.researchEvidence.studyCount} studies`);
console.log(`- Nitinol: ${nitinolData.researchEvidence.studyCount} studies\n`);

// Demo 10: Ontology System Information
console.log('ℹ️ Demo 10: System Information');
console.log(`Ontology Version: ${enhancedOntology.version}`);
console.log(`Evidence Level: ${enhancedOntology.evidenceLevel}`);
console.log(`Last Updated: ${enhancedOntology.lastUpdated}`);
console.log(`Gold Standard Studies: ${evidenceDB.goldStandardCount}`);
console.log('Data Sources:');
enhancedOntology.sources.forEach(source => {
    console.log(`- ${source}`);
});

console.log('\n🎉 Enhanced Medical Ontology System Demo Complete!');
console.log('📋 Key Features Demonstrated:');
console.log('   ✅ Research-backed material data');
console.log('   ✅ PMID reference integration'); 
console.log('   ✅ Evidence quality assessment');
console.log('   ✅ Clinical decision support');
console.log('   ✅ Comprehensive biocompatibility data');
console.log('   ✅ FDA classifications and ISO standards');
console.log('   ✅ Success rates and contraindications');
console.log('   ✅ Literature search and discovery');
console.log('\n🚀 Ready for Phase 2: Real PMID Integration!'); 