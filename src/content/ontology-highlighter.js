/**
 * Enhanced Ontology Highlighter - Detects and highlights medical materials with research evidence
 */
class OntologyHighlighter {
  constructor(ontology) {
    this.ontology = ontology || window.EnhancedMedicalOntology;
    this.evidenceDB = window.ResearchEvidenceDatabase;
    this.logger = new Logger('OntologyHighlighter');
    this.highlightedElements = new Set();
    this.observer = null;
    this.config = {
      highlightClass: 'if-highlight-medical',
      evidenceClass: 'if-highlight-evidence',
      scanDelay: 500,
      maxScanElements: 1000,
      enableTooltips: true,
      enableClickActions: true,
      enableEvidenceDisplay: true
    };
    this.scanTimeout = null;
  }

  async init() {
    this.logger.debug('Initializing ontology highlighter');
    
    if (!this.ontology) {
      this.logger.warn('Medical ontology not available, loading...');
      await this.loadOntology();
    }
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
    
    // Set up event listeners for highlighted elements
    this.setupEventListeners();
    
    this.logger.info('Ontology highlighter initialized');
  }

  async loadOntology() {
    try {
      // Try to load enhanced ontology from global scope
      if (window.EnhancedMedicalOntology) {
        this.ontology = window.EnhancedMedicalOntology;
        this.evidenceDB = window.ResearchEvidenceDatabase;
        this.logger.info('Enhanced medical ontology loaded with research evidence');
        return;
      }
      
      // Fallback: load enhanced ontology from file
      const ontologyResponse = await fetch(chrome.runtime.getURL('ontology/enhanced-medical-ontology.js'));
      const evidenceResponse = await fetch(chrome.runtime.getURL('ontology/research-evidence-db.js'));
      
      if (ontologyResponse.ok && evidenceResponse.ok) {
        const ontologyScript = await ontologyResponse.text();
        const evidenceScript = await evidenceResponse.text();
        eval(ontologyScript);
        eval(evidenceScript);
        this.ontology = window.EnhancedMedicalOntology;
        this.evidenceDB = window.ResearchEvidenceDatabase;
        this.logger.info('Enhanced ontology and evidence database loaded');
      }
    } catch (error) {
      this.logger.error('Failed to load enhanced medical ontology:', error);
      // Use basic fallback ontology
      this.ontology = this.getBasicOntology();
    }
  }

  getBasicOntology() {
    return {
      materials: {
        titanium: {
          regex: /\b(titanium|Ti-6Al-4V|Grade\s+\d+\s+titanium)\b/gi,
          category: 'metal',
          name: 'Titanium'
        },
        PEEK: {
          regex: /\b(PEEK|polyetheretherketone|poly\s*ether\s*ether\s*ketone)\b/gi,
          category: 'polymer',
          name: 'PEEK'
        },
        nitinol: {
          regex: /\b(nitinol|shape\s*memory\s*alloy|NiTi)\b/gi,
          category: 'shape-memory alloy',
          name: 'Nitinol'
        }
      }
    };
  }

  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain text
          const hasTextNodes = Array.from(mutation.addedNodes).some(node => 
            node.nodeType === Node.TEXT_NODE || 
            (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim())
          );
          
          if (hasTextNodes) {
            shouldScan = true;
          }
        }
      });
      
      if (shouldScan) {
        this.debouncedScan();
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  setupEventListeners() {
    // Handle clicks on highlighted materials
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains(this.config.highlightClass)) {
        this.handleMaterialClick(e.target, e);
      }
    });
    
    // Handle hover for tooltips
    if (this.config.enableTooltips) {
      document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains(this.config.highlightClass)) {
          this.handleMaterialHover(e.target, e);
        }
      });
      
      document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains(this.config.highlightClass)) {
          this.handleMaterialHoverOut(e.target, e);
        }
      });
    }
  }

  debouncedScan() {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
    
    this.scanTimeout = setTimeout(() => {
      this.highlightDocument();
    }, this.config.scanDelay);
  }

  highlightDocument() {
    this.logger.debug('Starting document scan for medical materials');
    
    const startTime = performance.now();
    let highlightCount = 0;
    
    try {
      // Get all text nodes in the document
      const textNodes = this.getTextNodes(document.body);
      
      // Limit processing for performance
      const nodesToProcess = textNodes.slice(0, this.config.maxScanElements);
      
      for (const textNode of nodesToProcess) {
        const highlights = this.highlightTextNode(textNode);
        highlightCount += highlights;
      }
      
      const endTime = performance.now();
      this.logger.info(`Highlighted ${highlightCount} materials in ${Math.round(endTime - startTime)}ms`);
      
    } catch (error) {
      this.logger.error('Error during document highlighting:', error);
    }
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and other non-content elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'iframe'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip already highlighted content
          if (parent.classList.contains(this.config.highlightClass)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip empty or whitespace-only nodes
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    return textNodes;
  }

  highlightTextNode(textNode) {
    if (!textNode.textContent.trim()) return 0;
    
    const originalText = textNode.textContent;
    let modifiedText = originalText;
    const matches = [];
    
    // Find all material matches using enhanced ontology
    if (this.ontology && this.ontology.getBiomaterials) {
      const biomaterials = this.ontology.getBiomaterials();
      for (const [materialId, material] of Object.entries(biomaterials)) {
        if (!material.regex) continue;
        
        const regex = new RegExp(material.regex.source, 'gi');
        let match;
        
        while ((match = regex.exec(originalText)) !== null) {
          matches.push({
            materialId,
            material,
            match: match[0],
            start: match.index,
            end: match.index + match[0].length
          });
        }
      }
    } else if (this.ontology && this.ontology.materials) {
      // Fallback for basic ontology
      for (const [materialId, material] of Object.entries(this.ontology.materials)) {
        if (!material.regex) continue;
        
        const regex = new RegExp(material.regex.source, 'gi');
        let match;
        
        while ((match = regex.exec(originalText)) !== null) {
          matches.push({
            materialId,
            material,
            match: match[0],
            start: match.index,
            end: match.index + match[0].length
          });
        }
      }
    }
    
    // Sort matches by position (descending to avoid offset issues)
    matches.sort((a, b) => b.start - a.start);
    
    if (matches.length === 0) return 0;
    
    // Apply highlights
    let highlightCount = 0;
    for (const matchInfo of matches) {
      const before = modifiedText.substring(0, matchInfo.start);
      const matchText = modifiedText.substring(matchInfo.start, matchInfo.end);
      const after = modifiedText.substring(matchInfo.end);
      
      const highlightSpan = `<span class="${this.config.highlightClass}" data-material="${matchInfo.materialId}" data-category="${matchInfo.material.category}" title="Medical Material: ${matchInfo.material.name}">${matchText}</span>`;
      
      modifiedText = before + highlightSpan + after;
      highlightCount++;
    }
    
    // Replace the text node with highlighted HTML
    if (highlightCount > 0) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modifiedText;
      
      const parent = textNode.parentNode;
      const fragment = document.createDocumentFragment();
      
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      parent.replaceChild(fragment, textNode);
      
      // Track highlighted elements
      parent.querySelectorAll(`.${this.config.highlightClass}`).forEach(el => {
        this.highlightedElements.add(el);
      });
    }
    
    return highlightCount;
  }

  handleMaterialClick(element, event) {
    if (!this.config.enableClickActions) return;
    
    event.stopPropagation();
    
    const materialId = element.dataset.material;
    const materialName = element.textContent;
    
    this.logger.debug(`Material clicked: ${materialName} (${materialId})`);
    
    // Show material information popup
    this.showMaterialPopup(element, materialId, materialName);
  }

  handleMaterialHover(element, event) {
    const materialId = element.dataset.material;
    const material = this.getMaterialInfo(materialId);
    
    if (!material) return;
    
    // Show tooltip with basic material info
    const tooltipText = `${material.name} - ${material.category}`;
    
    // Use UI feedback system if available
    if (window.inlineFeedbackExtension?.components?.get('uiFeedback')) {
      const uiFeedback = window.inlineFeedbackExtension.components.get('uiFeedback');
      uiFeedback.showTooltip(element, tooltipText, 'medical', 3000);
    }
  }

  handleMaterialHoverOut(element, event) {
    // Tooltip will auto-hide
  }

  showMaterialPopup(element, materialId, materialName) {
    const material = this.getMaterialInfo(materialId);
    
    if (!material) {
      this.logger.warn(`Material info not found for: ${materialId}`);
      return;
    }
    
    const rect = element.getBoundingClientRect();
    
    // Use UI feedback system if available
    if (window.inlineFeedbackExtension?.components?.get('uiFeedback')) {
      const uiFeedback = window.inlineFeedbackExtension.components.get('uiFeedback');
      
      uiFeedback.showPopup({
        title: material.name,
        subtitle: `Medical Material - ${material.category}`,
        content: this.generateMaterialDescription(material),
        position: { x: rect.left, y: rect.bottom + 10 },
        actions: [
          {
            text: 'Learn More',
            primary: true,
            handler: () => {
              this.requestDetailedInfo(materialId, materialName);
            }
          },
          {
            text: 'Properties',
            handler: () => {
              this.showMaterialProperties(materialId);
            }
          }
        ]
      });
    }
  }

  generateMaterialDescription(material) {
    let description = `Category: ${material.category}\n`;
    
    // Add evidence-based information
    if (material.researchEvidence) {
      const evidence = material.researchEvidence;
      description += `Clinical Success Rate: ${evidence.successRate}\n`;
      description += `Evidence Level: ${evidence.evidenceLevel} (${evidence.studyCount} studies)\n\n`;
    }
    
    if (material.properties) {
      description += "Key Properties:\n";
      for (const [key, value] of Object.entries(material.properties)) {
        description += `• ${key}: ${value}\n`;
      }
      description += "\n";
    }
    
    if (material.medicalApplications) {
      description += "Medical Applications:\n";
      material.medicalApplications.forEach(use => {
        description += `• ${use}\n`;
      });
      description += "\n";
    }
    
    if (material.fdaClassification) {
      description += `FDA Classification: ${material.fdaClassification}\n`;
    }
    
    // Add biocompatibility findings
    if (material.biologicalEffects) {
      description += "\nBiocompatibility:\n";
      description += `• ${material.biologicalEffects.biocompatibility}\n`;
      if (material.biologicalEffects.osseointegration) {
        description += `• Osseointegration: ${material.biologicalEffects.osseointegration}\n`;
      }
    }
    
    // Add contraindications if available
    if (material.researchEvidence?.contraindications) {
      description += `\nContraindications: ${material.researchEvidence.contraindications.join(', ')}\n`;
    }
    
    description += "\nClick 'Learn More' for research citations and detailed analysis.";
    
    return description;
  }

  requestDetailedInfo(materialId, materialName) {
    // Get research evidence if available
    const material = this.getMaterialInfo(materialId);
    const researchContext = {};
    
    if (material?.researchEvidence?.pmidReferences) {
      researchContext.pmids = material.researchEvidence.pmidReferences;
      researchContext.studyCount = material.researchEvidence.studyCount;
      researchContext.evidenceLevel = material.researchEvidence.evidenceLevel;
    }
    
    // Trigger detailed lookup via the main extension with research context
    const event = new CustomEvent('inlineFeedbackAction', {
      detail: { 
        action: 'medical-explain', 
        text: materialName,
        context: { 
          materialId, 
          source: 'enhanced-ontology',
          research: researchContext,
          properties: material?.properties,
          applications: material?.medicalApplications,
          contraindications: material?.researchEvidence?.contraindications
        }
      }
    });
    document.dispatchEvent(event);
  }

  showMaterialProperties(materialId) {
    const material = this.getMaterialInfo(materialId);
    if (!material || !material.properties) return;
    
    // Create a detailed properties display
    let propertiesText = `Detailed Properties for ${material.name}:\n\n`;
    
    for (const [key, value] of Object.entries(material.properties)) {
      propertiesText += `${key}: ${value}\n`;
    }
    
    if (material.standards) {
      propertiesText += "\nApplicable Standards:\n";
      material.standards.forEach(standard => {
        propertiesText += `• ${standard}\n`;
      });
    }
    
    if (window.inlineFeedbackExtension?.components?.get('uiFeedback')) {
      const uiFeedback = window.inlineFeedbackExtension.components.get('uiFeedback');
      
      uiFeedback.showPopup({
        title: `${material.name} Properties`,
        subtitle: 'Technical Specifications',
        content: propertiesText,
        actions: [
          {
            text: 'Copy Properties',
            handler: () => {
              navigator.clipboard.writeText(propertiesText);
            }
          }
        ]
      });
    }
  }

  getMaterialInfo(materialId) {
    if (this.ontology?.getBiomaterials) {
      const biomaterials = this.ontology.getBiomaterials();
      return biomaterials[materialId];
    } else if (this.ontology?.materials) {
      // Fallback for basic ontology
      return this.ontology.materials[materialId];
    }
    return null;
  }

  // Public API methods
  scanElement(element) {
    const textNodes = this.getTextNodes(element);
    let totalHighlights = 0;
    
    for (const textNode of textNodes) {
      totalHighlights += this.highlightTextNode(textNode);
    }
    
    return totalHighlights;
  }

  removeHighlights(element = document.body) {
    const highlights = element.querySelectorAll(`.${this.config.highlightClass}`);
    
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
      this.highlightedElements.delete(highlight);
    });
    
    return highlights.length;
  }

  getHighlightStats() {
    const materialCounts = {};
    
    this.highlightedElements.forEach(element => {
      const materialId = element.dataset.material;
      materialCounts[materialId] = (materialCounts[materialId] || 0) + 1;
    });
    
    // Get available materials from enhanced ontology
    let availableMaterials = [];
    if (this.ontology?.getBiomaterials) {
      availableMaterials = Object.keys(this.ontology.getBiomaterials());
    } else if (this.ontology?.materials) {
      availableMaterials = Object.keys(this.ontology.materials);
    }
    
    return {
      totalHighlights: this.highlightedElements.size,
      materialCounts,
      availableMaterials,
      evidenceLevel: this.ontology?.evidenceLevel || 'basic',
      researchBacked: !!this.evidenceDB
    };
  }

  isEnabled() {
    return !!this.ontology;
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
    
    this.removeHighlights();
    this.highlightedElements.clear();
  }
}

// Make available globally
window.OntologyHighlighter = OntologyHighlighter; 