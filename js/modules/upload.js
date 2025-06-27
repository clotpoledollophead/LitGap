// Module for handling file upload functionality

export const uploadHandler = {
  files: [],
  
  init() {
      const uploadArea = document.getElementById('upload-area');
      const fileInput = document.getElementById('file-input');
      const uploadBtn = document.getElementById('upload-btn');
      
      // Setup drag and drop
      uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadArea.classList.add('dragging');
      });
      
      uploadArea.addEventListener('dragleave', () => {
          uploadArea.classList.remove('dragging');
      });
      
      uploadArea.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadArea.classList.remove('dragging');
          
          const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
          this.handleFiles(droppedFiles);
      });
      
      // Setup click to upload
      uploadArea.addEventListener('click', () => {
          fileInput.click();
      });
      
      uploadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.click();
      });
      
      fileInput.addEventListener('change', () => {
          const selectedFiles = Array.from(fileInput.files);
          this.handleFiles(selectedFiles);
          fileInput.value = ''; // Reset input
      });
  },
  
  handleFiles(newFiles) {
      if (newFiles.length === 0) return;
      
      // Add files to the array
      newFiles.forEach(file => {
          if (!this.files.some(f => f.name === file.name)) {
              this.files.push(file);
          }
      });
      
      this.renderFileList();
      this.updateAnalyzeButton();
  },
  
  removeFile(fileName) {
      this.files = this.files.filter(file => file.name !== fileName);
      this.renderFileList();
      this.updateAnalyzeButton();
  },
  
  renderFileList() {
      const fileListEl = document.getElementById('file-list');
      fileListEl.innerHTML = '';
      
      if (this.files.length === 0) {
          fileListEl.innerHTML = '<p class="no-files">No files selected</p>';
          return;
      }
      
      this.files.forEach(file => {
          const fileItem = document.createElement('div');
          fileItem.className = 'file-item';
          
          const fileNameDiv = document.createElement('div');
          fileNameDiv.className = 'file-name';
          
          // PDF icon using Lucide
          const icon = document.createElement('i');
          icon.setAttribute('data-lucide', 'file-type');
          
          const name = document.createElement('span');
          name.textContent = file.name;
          
          fileNameDiv.appendChild(icon);
          fileNameDiv.appendChild(name);
          
          const removeBtn = document.createElement('button');
          removeBtn.className = 'file-remove';
          removeBtn.setAttribute('aria-label', 'Remove file');
          
          const removeIcon = document.createElement('i');
          removeIcon.setAttribute('data-lucide', 'trash-2');
          removeBtn.appendChild(removeIcon);
          
          removeBtn.addEventListener('click', () => this.removeFile(file.name));
          
          fileItem.appendChild(fileNameDiv);
          fileItem.appendChild(removeBtn);
          fileListEl.appendChild(fileItem);
      });
      
      // Initialize Lucide icons in the newly added content
      lucide.createIcons();
  },
  
  updateAnalyzeButton() {
      const analyzeBtn = document.getElementById('analyze-btn');
      analyzeBtn.disabled = this.files.length < 1;
      
      // Update button text based on file count
      if (this.files.length === 0) {
          analyzeBtn.innerHTML = '<i data-lucide="search" class="btn-icon"></i> Analyze Papers';
      } else {
          analyzeBtn.innerHTML = `<i data-lucide="search" class="btn-icon"></i> Analyze ${this.files.length} Paper${this.files.length !== 1 ? 's' : ''}`;
      }
      
      // Initialize Lucide icons in the button
      lucide.createIcons();
  },
  
  getFiles() {
      return [...this.files];
  },
  
  clearFiles() {
      this.files = [];
      this.renderFileList();
      this.updateAnalyzeButton();
  }
};
