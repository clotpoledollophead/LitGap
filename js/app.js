// Import required modules
import { uploadHandler } from './modules/upload.js';
import { analyzeManager } from './modules/analysis.js';
import { uiManager } from './modules/ui.js';
import { pdfExtractor } from './modules/pdfExtractor.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    uploadHandler.init();
    analyzeManager.init();
    uiManager.init();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners for user interactions
function setupEventListeners() {
    // Analyze button click
    document.getElementById('analyze-btn').addEventListener('click', async () => {
        const files = uploadHandler.getFiles();
        if (files.length === 0) return;
        
        // Hide the intro section
        document.getElementById('app-intro').classList.add('hidden');
        
        // Hide upload section
        document.getElementById('upload-section').style.display = 'none';
        // Show results section
        document.getElementById('results-section').style.display = 'block';
        
        try {
            // Process each PDF file
            const papersData = await Promise.all(files.map(async (file, index) => {
                // Show extraction progress
                uiManager.showLoading(`Extracting text from ${file.name}...`);
                
                // Update progress step
                updateProgressStep('extract');
                
                const text = await pdfExtractor.extractText(file);
                return { file: file.name, text };
            }));
            
            // Hide loading overlay as we'll use the progress bar for analysis
            uiManager.hideLoading();
            
            // Analyze papers (progress indicators handled within the function)
            const analysisResults = await analyzeManager.analyzePapers(papersData);
            
            // Display results
            uiManager.displayResults(analysisResults);
            uiManager.showTabs();
            
            // Hide progress container once complete
            setTimeout(() => {
                uiManager.hideProgress();
            }, 1000);
            
        } catch (error) {
            console.error('Error during analysis:', error);
            uiManager.hideLoading();
            uiManager.hideProgress();
            uiManager.showError('An error occurred during analysis. Please try again.');
        }
    });
    
    // Tab switching from sidebar
    document.querySelectorAll('.sidebar-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let tabId;
            if (e.target.classList.contains('sidebar-tab')) {
                tabId = e.target.getAttribute('data-tab');
            } else {
                // In case the click is on an icon or text inside the button
                tabId = e.target.closest('.sidebar-tab').getAttribute('data-tab');
            }
            
            // Set the active tab
            uiManager.switchTab(tabId);
            
            // On mobile, close the sidebar after selection
            if (window.innerWidth < 768) {
                document.getElementById('sidebar').classList.remove('sidebar-open');
                document.body.classList.remove('sidebar-active');
            }
        });
    });
}

// Update progress step indicator
function updateProgressStep(step) {
    document.querySelectorAll('.progress-step').forEach(el => {
        const isCurrentStep = el.getAttribute('data-step') === step;
        const isPreviousStep = isCurrentStepBeforeCurrent(el.getAttribute('data-step'), step);
        
        el.classList.toggle('active', isCurrentStep);
        el.classList.toggle('completed', isPreviousStep);
    });
}

// Helper to determine if a step is before the current one
function isCurrentStepBeforeCurrent(stepToCheck, currentStep) {
    const steps = ['extract', 'analyze', 'compare', 'gaps'];
    return steps.indexOf(stepToCheck) < steps.indexOf(currentStep);
}
