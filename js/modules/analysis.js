// Module for analyzing papers and detecting research gaps

import { apiService } from './apiService.js';
import { pdfExtractor } from './pdfExtractor.js';
import { uiManager } from './ui.js';

export const analyzeManager = {
    results: [],
    
    init() {
        this.results = [];
    },
    
    async analyzePapers(papersData) {
        this.results = [];
        
        // Show progress indicators
        uiManager.showProgress();
        uiManager.updateProgress(5, 'Starting analysis...');
        
        // Process each paper
        for (let i = 0; i < papersData.length; i++) {
            const paper = papersData[i];
            try {
                // Update progress
                const paperProgress = Math.floor(5 + (i / papersData.length) * 65);
                uiManager.updateProgress(
                    paperProgress, 
                    `Analyzing paper ${i+1} of ${papersData.length}: ${paper.file}`
                );
                
                // Extract sections from text using LLM
                console.log(`Analyzing paper: ${paper.file}`);
                
                var sections = await pdfExtractor.extractSections(paper.text);
                sections = sections.replace(/```json\s*/g, "")
                    .replace(/```\s*/g, "")
                    .trim();
                
                try {
                    sections = JSON.parse(sections); // Parse the JSON response
                } catch (parseError) {
                    console.error('Failed to parse JSON response:', parseError);
                    sections = {
                        methodology: 'Error parsing response',
                        findings: 'Error parsing response',
                        limitations: 'Error parsing response'
                    };
                }
                
                this.results.push({
                    title: paper.file,
                    methodology: sections.methodology || 'Not identified',
                    findings: sections.findings || 'Not identified',
                    limitations: sections.limitations || 'Not identified',
                    text: paper.text // Keep the full text for further analysis if needed
                });
            } catch (error) {
                console.error(`Error analyzing paper ${paper.file}:`, error);
                this.results.push({
                    title: paper.file,
                    methodology: 'Error during analysis',
                    findings: 'Error during analysis',
                    limitations: 'Error during analysis',
                    text: paper.text
                });
            }
        }
        
        // Update progress for gap analysis
        uiManager.updateProgress(70, 'Analyzing research gaps across papers...');
        
        // Find research gaps across papers
        const gapsAnalysis = await this.detectResearchGaps();
        
        // Generate comparison data
        uiManager.updateProgress(85, 'Generating comparative analysis...');
        const comparisonData = await this.generateComparisonData();
        
        // Update progress to complete
        uiManager.updateProgress(100, 'Analysis complete');
        setTimeout(() => {
            uiManager.hideProgress();
        }, 1000);
        
        return {
            papers: this.results,
            gaps: gapsAnalysis,
            comparison: comparisonData
        };
    },
    
    async detectResearchGaps() {
        if (this.results.length === 0) return { gaps: [], recommendations: [] };
        
        // Prepare data for gap analysis - remove full text to save tokens
        const papersForAnalysis = this.results.map(paper => ({
            title: paper.title,
            methodology: paper.methodology,
            findings: paper.findings,
            limitations: paper.limitations
        }));
        
        const prompt = `
            Analyze the following academic papers' methodology, findings, and limitations to identify research gaps.
            Find common limitations, unexplored areas, methodological weaknesses, or unexplored populations.
            
            Papers analysis:
            ${JSON.stringify(papersForAnalysis)}
            
            IMPORTANT FORMATTING INSTRUCTIONS:
            - Use [[term]] syntax to highlight key concepts or important terms
            - Use **bold text** for section headings or critical points
            - Be specific about the gaps you identify
            
            Format your response as JSON with the following structure:
            {
                "gaps": [
                    {
                        "title": "Brief title of the research gap",
                        "description": "Detailed description of the gap",
                        "type": "methodological|population|unexplored_area|data_limitation", 
                        "relevance": "High|Medium|Low"
                    }
                ],
                "recommendations": [
                    "Recommendation 1",
                    "Recommendation 2"
                ]
            }
        `;

        try {
            const response = await apiService.callLLM(prompt);
            
            // Clean up the response in case it contains markdown code blocks
            const cleanedResponse = response.replace(/```json\s*/g, "")
                                           .replace(/```\s*/g, "")
                                           .trim();
            
            // Parse the JSON response
            return JSON.parse(cleanedResponse);
        } catch (error) {
            console.error('Error parsing research gaps response:', error);
            // Return default structure in case of error
            return {
                gaps: [],
                recommendations: []
            };
        }
    },
    
    async generateComparisonData() {
        if (this.results.length === 0) {
            return {
                similarities: [],
                differences: [],
                recommendations: []
            };
        }
        
        // Prepare data for comparison analysis
        const papersForAnalysis = this.results.map(paper => ({
            title: paper.title,
            methodology: paper.methodology,
            findings: paper.findings,
            limitations: paper.limitations
        }));
        
        const prompt = `
            Compare and analyze the following academic papers and generate a detailed comparison.
            
            Papers to compare:
            ${JSON.stringify(papersForAnalysis)}
            
            Please provide:
            1. A list of methodological and finding similarities across papers
            2. A list of key differences between the papers (mark contradicting viewpoints with [[CONTRADICTION]] at the start of the item)
            3. A list of recommendations for synthesizing these research findings
            
            IMPORTANT FORMATTING INSTRUCTIONS:
            - Use [[term]] syntax to highlight key concepts or important terms
            - Use **bold text** for section headings or critical points
            - Use {{term}} to highlight methodological terms
            - Use [[finding:term]] to highlight key findings
            - Use ((term)) to highlight limitations
            - Start any contradictory difference with [[CONTRADICTION]] so I can identify it
            
            Format your response as JSON with the following structure:
            {
                "similarities": [
                    "Similarity point 1",
                    "Similarity point 2"
                ],
                "differences": [
                    "Difference point 1",
                    "[[CONTRADICTION]] Difference point where papers contradict each other"
                ],
                "recommendations": [
                    "Recommendation 1",
                    "Recommendation 2"
                ]
            }
        `;
        
        try {
            const response = await apiService.callLLM(prompt);
            
            // Clean up the response in case it contains markdown code blocks
            const cleanedResponse = response.replace(/```json\s*/g, "")
                                         .replace(/```\s*/g, "")
                                         .trim();
            
            // Parse the JSON response
            return JSON.parse(cleanedResponse);
        } catch (error) {
            console.error('Error parsing comparison response:', error);
            // Return default structure in case of error
            return {
                similarities: [],
                differences: [],
                recommendations: []
            };
        }
    },
    
    getResults() {
        return {
            papers: this.results
        };
    }
};
