(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const f={files:[],init(){const e=document.getElementById("upload-area"),i=document.getElementById("file-input"),t=document.getElementById("upload-btn");e.addEventListener("dragover",s=>{s.preventDefault(),e.classList.add("dragging")}),e.addEventListener("dragleave",()=>{e.classList.remove("dragging")}),e.addEventListener("drop",s=>{s.preventDefault(),e.classList.remove("dragging");const n=Array.from(s.dataTransfer.files).filter(a=>a.type==="application/pdf");this.handleFiles(n)}),e.addEventListener("click",()=>{i.click()}),t.addEventListener("click",s=>{s.stopPropagation(),i.click()}),i.addEventListener("change",()=>{const s=Array.from(i.files);this.handleFiles(s),i.value=""})},handleFiles(e){e.length!==0&&(e.forEach(i=>{this.files.some(t=>t.name===i.name)||this.files.push(i)}),this.renderFileList(),this.updateAnalyzeButton())},removeFile(e){this.files=this.files.filter(i=>i.name!==e),this.renderFileList(),this.updateAnalyzeButton()},renderFileList(){const e=document.getElementById("file-list");if(e.innerHTML="",this.files.length===0){e.innerHTML='<p class="no-files">No files selected</p>';return}this.files.forEach(i=>{const t=document.createElement("div");t.className="file-item";const s=document.createElement("div");s.className="file-name";const n=document.createElement("i");n.setAttribute("data-lucide","file-type");const a=document.createElement("span");a.textContent=i.name,s.appendChild(n),s.appendChild(a);const o=document.createElement("button");o.className="file-remove",o.setAttribute("aria-label","Remove file");const r=document.createElement("i");r.setAttribute("data-lucide","trash-2"),o.appendChild(r),o.addEventListener("click",()=>this.removeFile(i.name)),t.appendChild(s),t.appendChild(o),e.appendChild(t)}),lucide.createIcons()},updateAnalyzeButton(){const e=document.getElementById("analyze-btn");e.disabled=this.files.length<1,this.files.length===0?e.innerHTML='<i data-lucide="search" class="btn-icon"></i> Analyze Papers':e.innerHTML=`<i data-lucide="search" class="btn-icon"></i> Analyze ${this.files.length} Paper${this.files.length!==1?"s":""}`,lucide.createIcons()},getFiles(){return[...this.files]},clearFiles(){this.files=[],this.renderFileList(),this.updateAnalyzeButton()}},u={modelVariant:"academic-analysis",setModel(e){this.modelVariant=e},async callLLM(e,i=[]){i.push({role:"user",parts:[{text:e}]});const t=new FormData;t.append("mes",e),t.append("history",JSON.stringify(i));try{const n=await(await fetch("https://script.google.com/macros/s/AKfycbxm25QuCJcPY_JXhS7o3FisD8j1AVOpLKlk5V-TDemOsDVVyZsyEGmD5FiXtNpvoHxR/exec",{method:"POST",body:t})).text();return i.push({role:"model",parts:[{text:n}]}),console.log(i),n}catch(s){throw console.error("Error:",s),s}}};window.pdfjsLib&&(pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js");const v={async extractText(e){return new Promise((i,t)=>{if(!window.pdfjsLib){t(new Error("PDF.js library not loaded"));return}const s=new FileReader;s.onload=async n=>{try{const a=new Uint8Array(n.target.result),r=await pdfjsLib.getDocument({data:a}).promise;let c="";for(let l=1;l<=r.numPages;l++){const m=(await(await r.getPage(l)).getTextContent()).items.map(h=>h.str).join(" ");c+=m+" "}i(c.trim())}catch(a){console.error("PDF extraction error:",a),t(a)}},s.onerror=n=>{t(n)},s.readAsArrayBuffer(e)})},async extractSections(e){const i=`
          Analyze the following text and extract very concise summaries for each of the following, strictly keeping each under 70 words:

          1. Methodology (max 70 words)
          2. Key findings (max 70 words)
          3. Limitations (max 70 words)

          Use compact language and bullet points where appropriate. Stay factual and neutral.
          
          IMPORTANT FORMATTING INSTRUCTIONS:
          - Use [[term]] syntax to highlight key concepts or important terms but not too frequently
          - Use **bold text** for section headings or critical points
          - Stay factual and neutral

          Format your response as JSON:
          {
          "methodology": "Brief description of methods used (max 70 words)",
          "findings": "Brief list of key findings (max 70 words)",
          "limitations": "Brief list of limitations (max 70 words)"
          }

          Paper text:
          ${e}
      `;try{return await u.callLLM(i)}catch(t){return console.error("Error extracting sections with LLM:",t),{methodology:"",findings:"",limitations:"",abstract:""}}}},d={init(){this.activeTab="summary"},showLoading(e="Loading..."){const i=document.getElementById("loading-overlay"),t=document.getElementById("loading-text");t.textContent=e,i.style.display="flex"},updateLoading(e){document.getElementById("loading-text").textContent=e},hideLoading(){document.getElementById("loading-overlay").style.display="none"},showProgress(){document.getElementById("progress-container").style.display="block"},updateProgress(e,i){const t=document.getElementById("progress-bar"),s=document.getElementById("progress-status"),n=document.getElementById("progress-percentage");t.style.width=`${e}%`,s.textContent=i,n.textContent=`${Math.round(e)}%`,this.updateProgressStepsByPercent(e)},updateProgressStepsByPercent(e){document.querySelectorAll(".progress-step"),e<25?this.setActiveStep("extract"):e<50?this.setActiveStep("analyze"):e<75?this.setActiveStep("compare"):this.setActiveStep("gaps")},setActiveStep(e){const i=["extract","analyze","compare","gaps"],t=i.indexOf(e);document.querySelectorAll(".progress-step").forEach((s,n)=>{const a=s.getAttribute("data-step"),o=i.indexOf(a);o<t?(s.classList.add("completed"),s.classList.remove("active")):o===t?(s.classList.add("active"),s.classList.remove("completed")):(s.classList.remove("active"),s.classList.remove("completed"))})},hideProgress(){document.getElementById("progress-container").style.display="none"},showTabs(){document.getElementById("results-section").style.display="block",document.getElementById("sidebar").classList.add("sidebar-open"),document.body.classList.add("sidebar-active")},switchTab(e){this.activeTab=e,document.querySelectorAll(".sidebar-tab").forEach(i=>{i.classList.toggle("active",i.getAttribute("data-tab")===e)}),document.querySelectorAll(".tab-pane").forEach(i=>{i.classList.toggle("active",i.id===`${e}-tab`)})},displayResults(e){this.papersData=e.papers||[],this.displaySummaries(e.papers),this.displayComparison(e.comparison),this.displayGaps(e.gaps)},displaySummaries(e){const i=document.getElementById("summary-tab");i.innerHTML="<h2>Paper Summaries</h2>";const t=document.createElement("table");t.className="summary-table consolidated-view";const s=document.createElement("thead");s.innerHTML=`
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
        `,t.appendChild(s);const n=document.createElement("tbody");e.forEach((a,o)=>{const r=document.createElement("tr");r.className="paper-name-row";const c=document.createElement("td");c.className="paper-name-cell",c.colSpan=3,c.innerHTML=`
                <div class="paper-name-container">
                    <i data-lucide="file-text" class="paper-icon"></i>
                    <span class="paper-name">${a.title}</span>
                </div>
            `,r.appendChild(c),n.appendChild(r);const l=document.createElement("tr");l.className="paper-content-row";const p=document.createElement("td");p.className="methodology-cell",p.innerHTML=this.formatContentWithHighlights(a.methodology,"method");const g=document.createElement("td");g.className="findings-cell",g.innerHTML=this.formatContentWithHighlights(a.findings,"finding");const m=document.createElement("td");if(m.className="limitations-cell",m.innerHTML=this.formatContentWithHighlights(a.limitations,"limitation"),l.appendChild(p),l.appendChild(g),l.appendChild(m),n.appendChild(l),o<e.length-1){const h=document.createElement("tr");h.className="spacer-row",h.innerHTML='<td colspan="3"></td>',n.appendChild(h)}}),t.appendChild(n),i.appendChild(t),lucide.createIcons()},showPaperContent(e){document.querySelectorAll(".paper-row").forEach(s=>{s.classList.toggle("active",s.getAttribute("data-paper-id")===e)});const t=document.querySelectorAll(".paper-tag")[e].querySelector("span").textContent;document.getElementById("current-paper-title").textContent=t},displayComparison(e){const i=document.getElementById("compare-tab");if(i.innerHTML="<h2>Research Comparison</h2>",!e||!e.similarities&&!e.differences&&!e.recommendations){const c=document.createElement("div");c.className="info-card",c.innerHTML=`
                <div class="info-card-content">
                    <i data-lucide="info" class="info-icon"></i>
                    <p>Comparison data is being generated. Please wait...</p>
                </div>
            `,i.appendChild(c),lucide.createIcons();return}const t=document.createElement("div");t.className="comparison-flex-container";const s=document.createElement("div");s.className="comparison-section similarities-section",s.innerHTML=`
            <div class="comparison-header">
                <i data-lucide="check-circle" class="comparison-icon"></i>
                <h3>Research Similarities</h3>
            </div>
            <div class="comparison-content">
                <ul class="comparison-list">
                    ${e.similarities&&e.similarities.length>0?e.similarities.map(c=>`<li>${this.highlightKeywords(c)}</li>`).join(""):"<li>No significant similarities found.</li>"}
                </ul>
            </div>
        `;const n=document.createElement("div");n.className="comparison-section differences-section";let a=[],o=!1;e.differences&&e.differences.length>0&&(a=e.differences.map(c=>{if(c.includes("[[CONTRADICTION]]")){o=!0;const l=c.replace("[[CONTRADICTION]]","").trim();return`<li class="contradiction-item">
                        <div class="contradiction-badge">Contradiction</div>
                        ${this.highlightKeywords(l)}
                    </li>`}else return`<li>${this.highlightKeywords(c)}</li>`})),n.innerHTML=`
            <div class="comparison-header">
                <i data-lucide="shuffle" class="comparison-icon"></i>
                <h3>Key Differences${o?' <span class="contradiction-note">(includes contradictions)</span>':""}</h3>
            </div>
            <div class="comparison-content">
                ${o?`
                <div class="contradiction-info">
                    <i data-lucide="alert-triangle" class="contradiction-icon"></i>
                    <p>Papers contain contradicting viewpoints on some topics.</p>
                </div>`:""}
                <ul class="comparison-list">
                    ${a.length>0?a.join(""):"<li>No key differences identified.</li>"}
                </ul>
            </div>
        `;const r=document.createElement("div");r.className="comparison-section recommendations-section",r.innerHTML=`
            <div class="comparison-header">
                <i data-lucide="lightbulb" class="comparison-icon"></i>
                <h3>Synthesis Recommendations</h3>
            </div>
            <div class="comparison-content">
                <ul class="comparison-list">
                    ${e.recommendations&&e.recommendations.length>0?e.recommendations.map(c=>`<li>${this.highlightKeywords(c)}</li>`).join(""):"<li>No recommendations available.</li>"}
                </ul>
            </div>
        `,t.appendChild(s),t.appendChild(n),t.appendChild(r),i.appendChild(t),lucide.createIcons()},displayGaps(e){const i=document.getElementById("gaps-tab");i.innerHTML=`
            <h2>Research Gaps Analysis</h2>
            <p class="card-subheader">Based on the analysis of the uploaded papers, the following research gaps were identified:</p>
        `;const t=document.createElement("div");if(t.className="gap-modal-overlay",t.id="gap-modal-overlay",t.innerHTML=`
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
        `,document.body.appendChild(t),document.getElementById("modal-close").addEventListener("click",()=>{document.getElementById("gap-modal-overlay").classList.remove("open"),document.body.style.overflow="auto"}),e&&e.gaps&&e.gaps.length>0){const s=document.createElement("div");s.className="gaps-container";const n=Array.isArray(this.papersData)?this.papersData.length:0;e.gaps.forEach((a,o)=>{const r=this.processTitleHighlights(a.title);let c="alert-circle";a.relevance&&a.relevance.toLowerCase()==="high"?c="alert-triangle":a.relevance&&a.relevance.toLowerCase()==="medium"?c="alert-circle":c="info";const l=document.createElement("div");l.className="gap-card",l.setAttribute("data-gap-id",o),l.innerHTML=`
                    <div class="gap-card-header">
                        <div class="gap-title-container">
                            <h3>
                                <i data-lucide="lightbulb" class="gap-icon"></i>
                                <span class="gap-title-text">${r}</span>
                            </h3>
                        </div>
                        <span class="relevance-tag relevance-${a.relevance.toLowerCase()}">
                            <i data-lucide="${c}" class="relevance-icon"></i>
                            ${a.relevance}
                        </span>
                    </div>
                    <div class="gap-card-content">
                        <p>${this.highlightKeywords(a.description)}</p>
                    </div>
                    <div class="gap-card-footer">
                        <div class="related-papers">
                            <i data-lucide="file-text" class="related-papers-icon"></i>
                            <span>Related to: ${n} paper(s)</span>
                        </div>
                        <button class="explore-gap-btn" data-gap-id="${o}">
                            <span>Explore gap</span>
                            <i data-lucide="external-link" class="explore-icon"></i>
                        </button>
                    </div>
                `,s.appendChild(l)}),i.appendChild(s),document.querySelectorAll(".explore-gap-btn").forEach(a=>{a.addEventListener("click",o=>{const r=o.currentTarget.getAttribute("data-gap-id");this.showGapDetails(e.gaps[r],r)})}),lucide.createIcons()}else{const s=document.createElement("div");s.className="info-card",s.innerHTML=`
                <i data-lucide="info" style="width:24px;height:24px;margin-right:8px;color:var(--info-color);"></i>
                <p>No significant research gaps were identified in the uploaded papers.</p>
            `,i.appendChild(s)}if(e&&e.recommendations&&e.recommendations.length>0){const s=document.createElement("div");s.className="recommendations-section",s.innerHTML=`
                <h3 style="margin: 32px 0 16px; display: flex; align-items: center;">
                    <i data-lucide="zap" style="width:24px;height:24px;margin-right:8px;color:var(--primary-color);"></i>
                    Recommendations for Future Research
                </h3>
            `;const n=document.createElement("ul");n.className="recommendation-list",e.recommendations.forEach(a=>{const o=document.createElement("li");o.innerHTML=this.highlightKeywords(a),n.appendChild(o)}),s.appendChild(n),i.appendChild(s)}lucide.createIcons()},processTitleHighlights(e){return e?e.replace(/\[\[(.*?)\]\]/g,'<span class="highlight-keyword">$1</span>'):""},showGapDetails(e,i){const t=document.getElementById("gap-modal-overlay"),s=document.getElementById("modal-gap-title"),n=document.getElementById("modal-content");s.textContent=e.title;const o=Array.isArray(this.papersData)?this.papersData:[];n.innerHTML=`
            <!-- Overview Section -->
            <div class="gap-modal-section">
                <div class="gap-overview">
                    <span class="gap-relevance relevance-${e.relevance.toLowerCase()}">${e.relevance}</span>
                    <p class="gap-description">${this.highlightKeywords(e.description)}</p>
                </div>
            </div>
            
            <!-- Related Papers Section -->
            <div class="gap-modal-section">
                <h3 class="gap-modal-section-title">
                    <i data-lucide="file-text" class="gap-modal-section-icon"></i>
                    Related Papers
                </h3>
                <p>(${o.length} papers)</p>
                
                <div class="related-papers-list">
                    ${o.map((r,c)=>{const l=r.limitations&&r.limitations.length>100?r.limitations.substring(0,200)+"...":r.limitations,p=this.highlightKeywords(r.findings);return`
                        <div class="related-paper-card">
                            <div class="related-paper-header">
                                <div class="related-paper-title">
                                    <i data-lucide="file-text" class="paper-icon"></i>
                                    ${r.title}
                                </div>
                                <span class="related-paper-date">${this.generateRandomDate()}</span>
                            </div>
                            <div class="related-paper-content">
                                <p class="related-paper-abstract">${p.substring(0,200)}${p.length>200?"...":""}</p>
                                <div class="related-paper-meta">
                                    <div class="finding-count">
                                        <i data-lucide="bar-chart-2" class="finding-count-icon"></i>
                                        3 findings
                                    </div>
                                </div>
                                <p class="related-paper-relationship">
                                    <strong>Relevance to gap:</strong> ${r.limitations?this.highlightKeywords(l):"This paper relates to the gap through its methodology and identified limitations"}
                                </p>
                            </div>
                        </div>
                    `}).join("")}
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
                        <p class="suggestion-text">Conduct a systematic review focusing on ${e.title.toLowerCase()}</p>
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
                        <a href="https://scholar.google.com/scholar?q=${encodeURIComponent(e.title)}" target="_blank">
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
                        <a href="https://arxiv.org/search/?query=${encodeURIComponent(e.title)}&searchtype=all" target="_blank">
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
                        <a href="https://www.semanticscholar.org/search?q=${encodeURIComponent(e.title)}" target="_blank">
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
                        <a href="https://www.researchgate.net/search?q=${encodeURIComponent(e.title)}" target="_blank">
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
                        <a href="https://www.jstor.org/action/doAdvancedSearch?q0=${encodeURIComponent(e.title)}" target="_blank">
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
                        <a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(e.title)}" target="_blank">
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
        `,t.classList.add("open"),document.body.style.overflow="hidden",lucide.createIcons()},generateRandomDate(){const e=Math.floor(Math.random()*3)+2021,i=Math.floor(Math.random()*12)+1,t=Math.floor(Math.random()*28)+1;return`${e}/${i}/${t}`},formatContentWithHighlights(e,i){if(!e)return"<p>Not available</p>";try{if(e.startsWith("{")&&e.endsWith("}")){const t=JSON.parse(e);e=Object.values(t).join(" ")}}catch{}return e=this.highlightKeywords(e,i),e.includes("- ")||e.includes("• ")?e.split(/(?:\r\n|\r|\n)/).filter(t=>t.trim().length>0).map(t=>(t=t.trim(),t.startsWith("- ")||t.startsWith("• ")?`<li>${t.substring(2)}</li>`:t)).join("").replace(/<li>/g,"<ul><li>").replace(/<\/li>/g,"</li></ul>"):e.split(/(?:\r\n|\r|\n)/).filter(t=>t.trim().length>0).map(t=>`<p>${t}</p>`).join("")},highlightKeywords(e,i){if(!e)return"";let t=e;return t=t.replace(/\[\[(.*?)\]\]/g,'<span class="highlight-keyword">$1</span>'),t=t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\{\{(.*?)\}\}/g,'<span class="highlight-method">$1</span>'),t=t.replace(/\[\[finding:(.*?)\]\]/g,'<span class="highlight-finding">$1</span>'),t=t.replace(/\(\((.*?)\)\)/g,'<span class="highlight-limitation">$1</span>'),t},showError(e){const i=document.createElement("div");i.className="error-toast",i.innerHTML=`
            <div class="error-toast-icon">
                <i data-lucide="alert-circle"></i>
            </div>
            <div class="error-toast-content">
                <p>${e}</p>
            </div>
            <button class="error-toast-close">
                <i data-lucide="x"></i>
            </button>
        `,document.body.appendChild(i),lucide.createIcons(),i.querySelector(".error-toast-close").addEventListener("click",()=>{i.classList.add("closing"),setTimeout(()=>{document.body.removeChild(i)},300)}),setTimeout(()=>{document.body.contains(i)&&(i.classList.add("closing"),setTimeout(()=>{document.body.contains(i)&&document.body.removeChild(i)},300))},5e3),setTimeout(()=>{i.classList.add("show")},10)}},y={results:[],init(){this.results=[]},async analyzePapers(e){this.results=[],d.showProgress(),d.updateProgress(5,"Starting analysis...");for(let n=0;n<e.length;n++){const a=e[n];try{const o=Math.floor(5+n/e.length*65);d.updateProgress(o,`Analyzing paper ${n+1} of ${e.length}: ${a.file}`),console.log(`Analyzing paper: ${a.file}`);var i=await v.extractSections(a.text);i=i.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();try{i=JSON.parse(i)}catch(r){console.error("Failed to parse JSON response:",r),i={methodology:"Error parsing response",findings:"Error parsing response",limitations:"Error parsing response"}}this.results.push({title:a.file,methodology:i.methodology||"Not identified",findings:i.findings||"Not identified",limitations:i.limitations||"Not identified",text:a.text})}catch(o){console.error(`Error analyzing paper ${a.file}:`,o),this.results.push({title:a.file,methodology:"Error during analysis",findings:"Error during analysis",limitations:"Error during analysis",text:a.text})}}d.updateProgress(70,"Analyzing research gaps across papers...");const t=await this.detectResearchGaps();d.updateProgress(85,"Generating comparative analysis...");const s=await this.generateComparisonData();return d.updateProgress(100,"Analysis complete"),setTimeout(()=>{d.hideProgress()},1e3),{papers:this.results,gaps:t,comparison:s}},async detectResearchGaps(){if(this.results.length===0)return{gaps:[],recommendations:[]};const e=this.results.map(t=>({title:t.title,methodology:t.methodology,findings:t.findings,limitations:t.limitations})),i=`
            Analyze the following academic papers' methodology, findings, and limitations to identify research gaps.
            Find common limitations, unexplored areas, methodological weaknesses, or unexplored populations.
            
            Papers analysis:
            ${JSON.stringify(e)}
            
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
        `;try{const s=(await u.callLLM(i)).replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();return JSON.parse(s)}catch(t){return console.error("Error parsing research gaps response:",t),{gaps:[],recommendations:[]}}},async generateComparisonData(){if(this.results.length===0)return{similarities:[],differences:[],recommendations:[]};const e=this.results.map(t=>({title:t.title,methodology:t.methodology,findings:t.findings,limitations:t.limitations})),i=`
            Compare and analyze the following academic papers and generate a detailed comparison.
            
            Papers to compare:
            ${JSON.stringify(e)}
            
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
        `;try{const s=(await u.callLLM(i)).replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();return JSON.parse(s)}catch(t){return console.error("Error parsing comparison response:",t),{similarities:[],differences:[],recommendations:[]}}},getResults(){return{papers:this.results}}};document.addEventListener("DOMContentLoaded",()=>{f.init(),y.init(),d.init(),b()});function b(){document.getElementById("analyze-btn").addEventListener("click",async()=>{const e=f.getFiles();if(e.length!==0){document.getElementById("app-intro").classList.add("hidden"),document.getElementById("upload-section").style.display="none",document.getElementById("results-section").style.display="block";try{const i=await Promise.all(e.map(async(s,n)=>{d.showLoading(`Extracting text from ${s.name}...`),w("extract");const a=await v.extractText(s);return{file:s.name,text:a}}));d.hideLoading();const t=await y.analyzePapers(i);d.displayResults(t),d.showTabs(),setTimeout(()=>{d.hideProgress()},1e3)}catch(i){console.error("Error during analysis:",i),d.hideLoading(),d.hideProgress(),d.showError("An error occurred during analysis. Please try again.")}}}),document.querySelectorAll(".sidebar-tab").forEach(e=>{e.addEventListener("click",i=>{let t;i.target.classList.contains("sidebar-tab")?t=i.target.getAttribute("data-tab"):t=i.target.closest(".sidebar-tab").getAttribute("data-tab"),d.switchTab(t),window.innerWidth<768&&(document.getElementById("sidebar").classList.remove("sidebar-open"),document.body.classList.remove("sidebar-active"))})})}function w(e){document.querySelectorAll(".progress-step").forEach(i=>{const t=i.getAttribute("data-step")===e,s=E(i.getAttribute("data-step"),e);i.classList.toggle("active",t),i.classList.toggle("completed",s)})}function E(e,i){const t=["extract","analyze","compare","gaps"];return t.indexOf(e)<t.indexOf(i)}
