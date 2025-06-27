// Module for managing UI components and interactions

export const uiManager = {
  init() {
    // Initialize UI state
    this.activeTab = 'summary';
    // Removing hardcoded keyword lists - will rely on LLM markup instead
  },

  showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');

    loadingText.textContent = message;
    overlay.style.display = 'flex';
  },

  updateLoading(message) {
    document.getElementById('loading-text').textContent = message;
  },

  hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
  },

  // Progress tracking functionality
  showProgress() {
    document.getElementById('progress-container').style.display = 'block';
  },

  updateProgress(percent, message) {
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('progress-status');
    const percentText = document.getElementById('progress-percentage');

    progressBar.style.width = `${percent}%`;
    statusText.textContent = message;
    percentText.textContent = `${Math.round(percent)}%`;

    // Update progress steps
    this.updateProgressStepsByPercent(percent);
  },

  updateProgressStepsByPercent(percent) {
    const steps = document.querySelectorAll('.progress-step');

    if (percent < 25) {
      this.setActiveStep('extract');
    } else if (percent < 50) {
      this.setActiveStep('analyze');
    } else if (percent < 75) {
      this.setActiveStep('compare');
    } else {
      this.setActiveStep('gaps');
    }
  },

  setActiveStep(activeStep) {
    const steps = ['extract', 'analyze', 'compare', 'gaps'];
    const currentIndex = steps.indexOf(activeStep);

    document.querySelectorAll('.progress-step').forEach((step, index) => {
      const stepName = step.getAttribute('data-step');
      const stepIndex = steps.indexOf(stepName);

      if (stepIndex < currentIndex) {
        // Completed steps
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepIndex === currentIndex) {
        // Current step
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        // Future steps
        step.classList.remove('active');
        step.classList.remove('completed');
      }
    });
  },

  hideProgress() {
    document.getElementById('progress-container').style.display = 'none';
  },

  showTabs() {
    document.getElementById('results-section').style.display = 'block';
    // Show sidebar in icon-only mode first
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('sidebar-open');
    document.body.classList.add('sidebar-active');
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update active tab button
    document.querySelectorAll('.sidebar-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Show active tab content
    document.querySelectorAll('.tab-pane').forEach((tab) => {
      tab.classList.toggle('active', tab.id === `${tabId}-tab`);
    });
  },

  // Store the results when displaying them for the first time
  displayResults(results) {
    // Store the complete results in the UI manager for later use
    this.papersData = results.papers || [];

    // Display paper comparisons in summary tab
    this.displaySummaries(results.papers);

    // Display AI-generated comparison analysis
    this.displayComparison(results.comparison);

    // Display gaps analysis
    this.displayGaps(results.gaps);
  },

  displaySummaries(papers) {
    const summaryTab = document.getElementById('summary-tab');
    summaryTab.innerHTML = '<h2>Paper Summaries</h2>';

    // Create a single consolidated table for all papers
    const table = document.createElement('table');
    table.className = 'summary-table consolidated-view';

    // Create table header (shown only once)
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th class="methodology-header">
                    <div class="section-header">
                        <div class="section-icon-container methodology-icon-container">
                            <i data-lucide="microscope" class="section-icon methodology-icon"></i>
                        </div>
                        <h3>Methodology</h3>
                    </div>
                </th>
                <th class="findings-header">
                    <div class="section-header">
                        <div class="section-icon-container findings-icon-container">
                            <i data-lucide="bar-chart-2" class="section-icon findings-icon"></i>
                        </div>
                        <h3>Key Findings</h3>
                    </div>
                </th>
                <th class="limitations-header">
                    <div class="section-header">
                        <div class="section-icon-container limitations-icon-container">
                            <i data-lucide="alert-triangle" class="section-icon limitations-icon"></i>
                        </div>
                        <h3>Limitations</h3>
                    </div>
                </th>
            </tr>
        `;
    table.appendChild(thead);

    // Create table body with all papers
    const tbody = document.createElement('tbody');

    papers.forEach((paper, index) => {
      // Paper name row spanning all columns
      const nameRow = document.createElement('tr');
      nameRow.className = 'paper-name-row';

      const nameCell = document.createElement('td');
      nameCell.className = 'paper-name-cell';
      nameCell.colSpan = 3;
      nameCell.innerHTML = `
                <div class="paper-name-container">
                    <i data-lucide="file-text" class="paper-icon"></i>
                    <span class="paper-name">${paper.title}</span>
                </div>
            `;

      nameRow.appendChild(nameCell);
      tbody.appendChild(nameRow);

      // Content row
      const contentRow = document.createElement('tr');
      contentRow.className = 'paper-content-row';

      // Methodology cell
      const methodologyCell = document.createElement('td');
      methodologyCell.className = 'methodology-cell';
      methodologyCell.innerHTML = this.formatContentWithHighlights(
        paper.methodology,
        'method'
      );

      // Findings cell
      const findingsCell = document.createElement('td');
      findingsCell.className = 'findings-cell';
      findingsCell.innerHTML = this.formatContentWithHighlights(
        paper.findings,
        'finding'
      );

      // Limitations cell
      const limitationsCell = document.createElement('td');
      limitationsCell.className = 'limitations-cell';
      limitationsCell.innerHTML = this.formatContentWithHighlights(
        paper.limitations,
        'limitation'
      );

      contentRow.appendChild(methodologyCell);
      contentRow.appendChild(findingsCell);
      contentRow.appendChild(limitationsCell);

      tbody.appendChild(contentRow);

      // Add spacer row if not the last paper
      if (index < papers.length - 1) {
        const spacerRow = document.createElement('tr');
        spacerRow.className = 'spacer-row';
        spacerRow.innerHTML = '<td colspan="3"></td>';
        tbody.appendChild(spacerRow);
      }
    });

    table.appendChild(tbody);
    summaryTab.appendChild(table);

    // Initialize Lucide icons
    lucide.createIcons();
  },

  // Helper method to show paper content
  showPaperContent(paperId) {
    // Update paper rows visibility
    document.querySelectorAll('.paper-row').forEach((row) => {
      row.classList.toggle(
        'active',
        row.getAttribute('data-paper-id') === paperId
      );
    });

    // Update paper title
    const paperTags = document.querySelectorAll('.paper-tag');
    const paperTitle = paperTags[paperId].querySelector('span').textContent;
    document.getElementById('current-paper-title').textContent = paperTitle;
  },

  displayComparison(comparison) {
    const compareTab = document.getElementById('compare-tab');
    compareTab.innerHTML = '<h2>Research Comparison</h2>';

    // If no comparison data available yet
    if (
      !comparison ||
      (!comparison.similarities &&
        !comparison.differences &&
        !comparison.recommendations)
    ) {
      const noData = document.createElement('div');
      noData.className = 'info-card';
      noData.innerHTML = `
                <div class="info-card-content">
                    <i data-lucide="info" class="info-icon"></i>
                    <p>Comparison data is being generated. Please wait...</p>
                </div>
            `;
      compareTab.appendChild(noData);
      lucide.createIcons();
      return;
    }

    // Create a flex container for side-by-side sections
    const flexContainer = document.createElement('div');
    flexContainer.className = 'comparison-flex-container';

    // 1. Similarities section (soft green)
    const similaritiesSection = document.createElement('div');
    similaritiesSection.className = 'comparison-section similarities-section';
    similaritiesSection.innerHTML = `
            <div class="comparison-header">
                <i data-lucide="check-circle" class="comparison-icon"></i>
                <h3>Research Similarities</h3>
            </div>
            <div class="comparison-content">
                <ul class="comparison-list">
                    ${
                      comparison.similarities &&
                      comparison.similarities.length > 0
                        ? comparison.similarities
                            .map(
                              (item) =>
                                `<li>${this.highlightKeywords(item)}</li>`
                            )
                            .join('')
                        : '<li>No significant similarities found.</li>'
                    }
                </ul>
            </div>
        `;

    // 2. Differences section (soft orange)
    // Rely on LLM to identify contradictions via the special [[CONTRADICTION]] marker
    const differencesSection = document.createElement('div');
    differencesSection.className = 'comparison-section differences-section';

    // Process differences to identify LLM-marked contradictions
    let processedDifferences = [];
    let foundContradictions = false;

    if (comparison.differences && comparison.differences.length > 0) {
      processedDifferences = comparison.differences.map((item) => {
        // Check if the LLM has marked this as a contradiction
        if (item.includes('[[CONTRADICTION]]')) {
          foundContradictions = true;
          // Remove the marker and highlight as contradiction
          const cleanedItem = item.replace('[[CONTRADICTION]]', '').trim();
          return `<li class="contradiction-item">
                        <div class="contradiction-badge">Contradiction</div>
                        ${this.highlightKeywords(cleanedItem)}
                    </li>`;
        } else {
          return `<li>${this.highlightKeywords(item)}</li>`;
        }
      });
    }

    differencesSection.innerHTML = `
            <div class="comparison-header">
                <i data-lucide="shuffle" class="comparison-icon"></i>
                <h3>Key Differences${
                  foundContradictions
                    ? ' <span class="contradiction-note">(includes contradictions)</span>'
                    : ''
                }</h3>
            </div>
            <div class="comparison-content">
                ${
                  foundContradictions
                    ? `
                <div class="contradiction-info">
                    <i data-lucide="alert-triangle" class="contradiction-icon"></i>
                    <p>Papers contain contradicting viewpoints on some topics.</p>
                </div>`
                    : ''
                }
                <ul class="comparison-list">
                    ${
                      processedDifferences.length > 0
                        ? processedDifferences.join('')
                        : '<li>No key differences identified.</li>'
                    }
                </ul>
            </div>
        `;

    // 3. Recommendations section (soft blue)
    const recommendationsSection = document.createElement('div');
    recommendationsSection.className =
      'comparison-section recommendations-section';
    recommendationsSection.innerHTML = `
            <div class="comparison-header">
                <i data-lucide="lightbulb" class="comparison-icon"></i>
                <h3>Synthesis Recommendations</h3>
            </div>
            <div class="comparison-content">
                <ul class="comparison-list">
                    ${
                      comparison.recommendations &&
                      comparison.recommendations.length > 0
                        ? comparison.recommendations
                            .map(
                              (item) =>
                                `<li>${this.highlightKeywords(item)}</li>`
                            )
                            .join('')
                        : '<li>No recommendations available.</li>'
                    }
                </ul>
            </div>
        `;

    // Add all sections to the flex container
    flexContainer.appendChild(similaritiesSection);
    flexContainer.appendChild(differencesSection);
    flexContainer.appendChild(recommendationsSection);

    // Add the flex container to the tab
    compareTab.appendChild(flexContainer);

    // Initialize Lucide icons
    lucide.createIcons();
  },

  displayGaps(gaps) {
    const gapsTab = document.getElementById('gaps-tab');
    gapsTab.innerHTML = `
            <h2>Research Gaps Analysis</h2>
            <p class="card-subheader">Based on the analysis of the uploaded papers, the following research gaps were identified:</p>
        `;

    // Create modal container that will be used for gap exploration
    const modalContainer = document.createElement('div');
    modalContainer.className = 'gap-modal-overlay';
    modalContainer.id = 'gap-modal-overlay';
    modalContainer.innerHTML = `
            <div class="gap-modal">
                <div class="gap-modal-header">
                    <h2 id="modal-gap-title">Gap Details</h2>
                    <button class="gap-modal-close" id="modal-close">
                        <i data-lucide="x" class="gap-modal-close-icon"></i>
                    </button>
                </div>
                <div class="gap-modal-body" id="modal-content">
                    <!-- Modal content will be populated dynamically -->
                </div>
            </div>
        `;
    document.body.appendChild(modalContainer);

    // Setup modal close button
    document.getElementById('modal-close').addEventListener('click', () => {
      document.getElementById('gap-modal-overlay').classList.remove('open');
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    });

    // Display research gaps
    if (gaps && gaps.gaps && gaps.gaps.length > 0) {
      const gapsContainer = document.createElement('div');
      gapsContainer.className = 'gaps-container';

      // Get accurate paper count from stored data
      // This fixes the "Related to: 0 paper(s)" issue
      const paperCount = Array.isArray(this.papersData)
        ? this.papersData.length
        : 0;

      gaps.gaps.forEach((gap, index) => {
        // Process title to properly highlight terms
        const processedTitle = this.processTitleHighlights(gap.title);

        // Get appropriate icon for relevance level
        let relevanceIcon = 'alert-circle';
        if (gap.relevance && gap.relevance.toLowerCase() === 'high') {
          relevanceIcon = 'alert-triangle';
        } else if (gap.relevance && gap.relevance.toLowerCase() === 'medium') {
          relevanceIcon = 'alert-circle';
        } else {
          relevanceIcon = 'info';
        }

        // Create the gap card with modern design
        const gapCard = document.createElement('div');
        gapCard.className = 'gap-card';
        gapCard.setAttribute('data-gap-id', index);

        gapCard.innerHTML = `
                    <div class="gap-card-header">
                        <div class="gap-title-container">
                            <h3>
                                <i data-lucide="lightbulb" class="gap-icon"></i>
                                <span class="gap-title-text">${processedTitle}</span>
                            </h3>
                        </div>
                        <span class="relevance-tag relevance-${gap.relevance.toLowerCase()}">
                            <i data-lucide="${relevanceIcon}" class="relevance-icon"></i>
                            ${gap.relevance}
                        </span>
                    </div>
                    <div class="gap-card-content">
                        <p>${this.highlightKeywords(gap.description)}</p>
                    </div>
                    <div class="gap-card-footer">
                        <div class="related-papers">
                            <i data-lucide="file-text" class="related-papers-icon"></i>
                            <span>Related to: ${paperCount} paper(s)</span>
                        </div>
                        <button class="explore-gap-btn" data-gap-id="${index}">
                            <span>Explore gap</span>
                            <i data-lucide="external-link" class="explore-icon"></i>
                        </button>
                    </div>
                `;

        gapsContainer.appendChild(gapCard);
      });

      gapsTab.appendChild(gapsContainer);

      // Add event listeners for explore buttons
      document.querySelectorAll('.explore-gap-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
          const gapId = e.currentTarget.getAttribute('data-gap-id');
          this.showGapDetails(gaps.gaps[gapId], gapId);
        });
      });

      // Initialize Lucide icons
      lucide.createIcons();
    } else {
      const noGaps = document.createElement('div');
      noGaps.className = 'info-card';
      noGaps.innerHTML = `
                <i data-lucide="info" style="width:24px;height:24px;margin-right:8px;color:var(--info-color);"></i>
                <p>No significant research gaps were identified in the uploaded papers.</p>
            `;
      gapsTab.appendChild(noGaps);
    }

    // Display recommendations
    if (gaps && gaps.recommendations && gaps.recommendations.length > 0) {
      const recSection = document.createElement('div');
      recSection.className = 'recommendations-section';
      recSection.innerHTML = `
                <h3 style="margin: 32px 0 16px; display: flex; align-items: center;">
                    <i data-lucide="zap" style="width:24px;height:24px;margin-right:8px;color:var(--primary-color);"></i>
                    Recommendations for Future Research
                </h3>
            `;

      const recList = document.createElement('ul');
      recList.className = 'recommendation-list';

      gaps.recommendations.forEach((rec) => {
        const item = document.createElement('li');
        item.innerHTML = this.highlightKeywords(rec);
        recList.appendChild(item);
      });

      recSection.appendChild(recList);
      gapsTab.appendChild(recSection);
    }

    // Initialize Lucide icons
    lucide.createIcons();
  },

  // New helper method to process title highlights
  processTitleHighlights(title) {
    if (!title) return '';

    // Replace [[term]] with highlighted spans
    return title.replace(
      /\[\[(.*?)\]\]/g,
      '<span class="highlight-keyword">$1</span>'
    );
  },

  // New method to show detailed gap information in a modal
  showGapDetails(gap, gapId) {
    const modalOverlay = document.getElementById('gap-modal-overlay');
    const modalTitle = document.getElementById('modal-gap-title');
    const modalContent = document.getElementById('modal-content');

    // Set the title
    modalTitle.textContent = gap.title;

    // Get related papers data - only include papers that are relevant to this gap
    // This is determined based on methodologies or limitations relevant to the gap
    const allPapers = Array.isArray(this.papersData) ? this.papersData : [];

    // For demo purposes, we'll assume all papers are related, but in a real app this would filter
    const relatedPapers = allPapers;

    // Generate content for the modal
    modalContent.innerHTML = `
            <!-- Overview Section -->
            <div class="gap-modal-section">
                <div class="gap-overview">
                    <span class="gap-relevance relevance-${gap.relevance.toLowerCase()}">${
      gap.relevance
    }</span>
                    <p class="gap-description">${this.highlightKeywords(
                      gap.description
                    )}</p>
                </div>
            </div>
            
            <!-- Related Papers Section -->
            <div class="gap-modal-section">
                <h3 class="gap-modal-section-title">
                    <i data-lucide="file-text" class="gap-modal-section-icon"></i>
                    Related Papers
                </h3>
                <p>(${relatedPapers.length} papers)</p>
                
                <div class="related-papers-list">
                    ${relatedPapers
                      .map((paper, index) => {
                        // Extract relevant parts of the paper related to this gap
                        const relevantLimitations =
                          paper.limitations && paper.limitations.length > 100
                            ? paper.limitations.substring(0, 200) + '...'
                            : paper.limitations;

                        // Apply formatting to highlight keywords in paper content
                        const formattedAbstract = this.highlightKeywords(
                          paper.findings
                        );

                        return `
                        <div class="related-paper-card">
                            <div class="related-paper-header">
                                <div class="related-paper-title">
                                    <i data-lucide="file-text" class="paper-icon"></i>
                                    ${paper.title}
                                </div>
                                <span class="related-paper-date">${this.generateRandomDate()}</span>
                            </div>
                            <div class="related-paper-content">
                                <p class="related-paper-abstract">${formattedAbstract.substring(
                                  0,
                                  200
                                )}${
                          formattedAbstract.length > 200 ? '...' : ''
                        }</p>
                                <div class="related-paper-meta">
                                    <div class="finding-count">
                                        <i data-lucide="bar-chart-2" class="finding-count-icon"></i>
                                        3 findings
                                    </div>
                                </div>
                                <p class="related-paper-relationship">
                                    <strong>Relevance to gap:</strong> ${
                                      paper.limitations
                                        ? this.highlightKeywords(
                                            relevantLimitations
                                          )
                                        : 'This paper relates to the gap through its methodology and identified limitations'
                                    }
                                </p>
                            </div>
                        </div>
                    `;
                      })
                      .join('')}
                </div>
            </div>
            
            <!-- Research Suggestions Section -->
            <div class="gap-modal-section">
                <h3 class="gap-modal-section-title">
                    <i data-lucide="lightbulb" class="gap-modal-section-icon"></i>
                    Research Suggestions & Next Steps
                </h3>
                
                <div class="suggestions-grid">
                    <div class="suggestion-card">
                        <div class="suggestion-number">1</div>
                        <p class="suggestion-text">This high-priority gap requires immediate attention - consider collaborative research initiatives</p>
                    </div>
                    <div class="suggestion-card">
                        <div class="suggestion-number">2</div>
                        <p class="suggestion-text">Conduct a systematic review focusing on ${gap.title.toLowerCase()}</p>
                    </div>
                    <div class="suggestion-card">
                        <div class="suggestion-number">3</div>
                        <p class="suggestion-text">Design an empirical study to address the methodological limitations identified</p>
                    </div>
                    <div class="suggestion-card">
                        <div class="suggestion-number">4</div>
                        <p class="suggestion-text">Explore interdisciplinary approaches to bridge this research gap</p>
                    </div>
                </div>
                
                <h4 style="margin-top: var(--space-4); margin-bottom: var(--space-3);">Recommended Research Approaches:</h4>
                <div class="approaches-container">
                    <div class="approach-tag">
                        <i data-lucide="users" class="approach-icon"></i>
                        Collaborative studies
                    </div>
                    <div class="approach-tag">
                        <i data-lucide="search" class="approach-icon"></i>
                        Systematic reviews
                    </div>
                    <div class="approach-tag">
                        <i data-lucide="bar-chart" class="approach-icon"></i>
                        Meta-analyses
                    </div>
                    <div class="approach-tag">
                        <i data-lucide="flask-conical" class="approach-icon"></i>
                        Empirical validation
                    </div>
                </div>
            </div>
            
            <!-- External Resources Section -->
            <div class="gap-modal-section">
                <h3 class="gap-modal-section-title">
                    <i data-lucide="database" class="gap-modal-section-icon"></i>
                    External Resources & Databases
                </h3>
                
                <div class="resources-grid resources-grid-organized">
                    <!-- Row 1: Google Scholar, arXiv, Semantic Scholar -->
                    <div class="resource-card">
                        <a href="https://scholar.google.com/scholar?q=${encodeURIComponent(
                          gap.title
                        )}" target="_blank">
                            <div class="resource-header">
                                <i data-lucide="graduation-cap" class="resource-icon"></i>
                                <h4 class="resource-title">Google Scholar</h4>
                            </div>
                            <div class="resource-content">
                                Search for recent publications related to this gap
                                <div class="resource-type">database</div>
                            </div>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="https://arxiv.org/search/?query=${encodeURIComponent(
                          gap.title
                        )}&searchtype=all" target="_blank">
                            <div class="resource-header">
                                <i data-lucide="book-open" class="resource-icon"></i>
                                <h4 class="resource-title">arXiv</h4>
                            </div>
                            <div class="resource-content">
                                Preprint repository for cutting-edge research
                                <div class="resource-type">repository</div>
                            </div>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="https://www.semanticscholar.org/search?q=${encodeURIComponent(
                          gap.title
                        )}" target="_blank">
                            <div class="resource-header">
                                <i data-lucide="brain" class="resource-icon"></i>
                                <h4 class="resource-title">Semantic Scholar</h4>
                            </div>
                            <div class="resource-content">
                                AI-powered research tool for discovering relevant papers
                                <div class="resource-type">tool</div>
                            </div>
                        </a>
                    </div>
                    
                    <!-- Row 2: ResearchGate, JSTOR, PubMed -->
                    <div class="resource-card">
                        <a href="https://www.researchgate.net/search?q=${encodeURIComponent(
                          gap.title
                        )}" target="_blank">
                            <div class="resource-header">
                                <i data-lucide="users" class="resource-icon"></i>
                                <h4 class="resource-title">ResearchGate</h4>
                            </div>
                            <div class="resource-content">
                                Connect with researchers working on similar topics
                                <div class="resource-type">repository</div>
                            </div>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="https://www.jstor.org/action/doAdvancedSearch?q0=${encodeURIComponent(
                          gap.title
                        )}" target="_blank">
                            <div class="resource-header">
                                <i data-lucide="library" class="resource-icon"></i>
                                <h4 class="resource-title">JSTOR</h4>
                            </div>
                            <div class="resource-content">
                                Academic journal archive and database
                                <div class="resource-type">journal</div>
                            </div>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(
                          gap.title
                        )}" target="_blank">
                            <div class="resource-header">
                                <i data-lucide="stethoscope" class="resource-icon"></i>
                                <h4 class="resource-title">PubMed</h4>
                            </div>
                            <div class="resource-content">
                                Medical and life sciences literature database
                                <div class="resource-type">database</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Search Tips Section -->
            <div class="gap-modal-section">
                <div class="search-tips">
                    <h4>
                        <i data-lucide="search" class="search-tips-icon"></i>
                        Search Tips:
                    </h4>
                    <ul>
                        <li>Use specific keywords from the gap title and description</li>
                        <li>Try different combinations of terms to broaden your search</li>
                        <li>Look for recent publications (last 2-3 years) for current state of research</li>
                    </ul>
                </div>
            </div>
        `;

    // Show the modal
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Initialize Lucide icons in the modal
    lucide.createIcons();
  },

  // Helper method to generate a random date for demo purposes
  generateRandomDate() {
    const year = Math.floor(Math.random() * 3) + 2021;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}/${month}/${day}`;
  },

  formatContentWithHighlights(content, type) {
    if (!content) return '<p>Not available</p>';

    // First check if content is a JSON string and try to parse it
    try {
      if (content.startsWith('{') && content.endsWith('}')) {
        const parsed = JSON.parse(content);
        content = Object.values(parsed).join(' ');
      }
    } catch (e) {
      // Not JSON, continue with string
    }

    content = this.highlightKeywords(content, type);

    // Check if content appears to be a list
    if (content.includes('- ') || content.includes('• ')) {
      // Convert to HTML bullet list
      return content
        .split(/(?:\r\n|\r|\n)/)
        .filter((line) => line.trim().length > 0)
        .map((line) => {
          line = line.trim();
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return `<li>${line.substring(2)}</li>`;
          }
          return line;
        })
        .join('')
        .replace(/<li>/g, '<ul><li>')
        .replace(/<\/li>/g, '</li></ul>');
    }

    // Regular content - split by paragraphs
    return content
      .split(/(?:\r\n|\r|\n)/)
      .filter((para) => para.trim().length > 0)
      .map((para) => `<p>${para}</p>`)
      .join('');
  },

  highlightKeywords(text, preferredType) {
    if (!text) return '';

    let highlightedText = text;

    // Process special LLM highlight syntax: [[key concept]]
    highlightedText = highlightedText.replace(
      /\[\[(.*?)\]\]/g,
      '<span class="highlight-keyword">$1</span>'
    );

    // Process markdown-style bold text: **bold text**
    highlightedText = highlightedText.replace(
      /\*\*(.*?)\*\*/g,
      '<strong>$1</strong>'
    );

    // Process method highlights: {{method}}
    highlightedText = highlightedText.replace(
      /\{\{(.*?)\}\}/g,
      '<span class="highlight-method">$1</span>'
    );

    // Process finding highlights: [[finding]]
    highlightedText = highlightedText.replace(
      /\[\[finding:(.*?)\]\]/g,
      '<span class="highlight-finding">$1</span>'
    );

    // Process limitation highlights: ((limitation))
    highlightedText = highlightedText.replace(
      /\(\((.*?)\)\)/g,
      '<span class="highlight-limitation">$1</span>'
    );

    return highlightedText;
  },

  showError(message) {
    // Use a more modern approach for showing errors
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-toast';
    errorContainer.innerHTML = `
            <div class="error-toast-icon">
                <i data-lucide="alert-circle"></i>
            </div>
            <div class="error-toast-content">
                <p>${message}</p>
            </div>
            <button class="error-toast-close">
                <i data-lucide="x"></i>
            </button>
        `;

    document.body.appendChild(errorContainer);

    // Initialize Lucide icons in the error toast
    lucide.createIcons();

    // Add close functionality
    errorContainer
      .querySelector('.error-toast-close')
      .addEventListener('click', () => {
        errorContainer.classList.add('closing');
        setTimeout(() => {
          document.body.removeChild(errorContainer);
        }, 300);
      });

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(errorContainer)) {
        errorContainer.classList.add('closing');
        setTimeout(() => {
          if (document.body.contains(errorContainer)) {
            document.body.removeChild(errorContainer);
          }
        }, 300);
      }
    }, 5000);

    // Animate in
    setTimeout(() => {
      errorContainer.classList.add('show');
    }, 10);
  },
};
