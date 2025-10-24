// Worksheet management functionality
class WorksheetManager {
    constructor() {
        this.uploadForm = document.getElementById('uploadForm');
        this.gradeFilter = document.getElementById('gradeFilter');
        this.subjectFilter = document.getElementById('subjectFilter');
        this.worksheetsGrid = document.getElementById('worksheetsGrid');

        this.setupEventListeners();
        this.loadWorksheets();
    }

    setupEventListeners() {
        this.uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        this.gradeFilter.addEventListener('change', () => this.handleFilters());
        this.subjectFilter.addEventListener('change', () => this.handleFilters());
    }

    async handleUpload(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('grade', document.getElementById('grade').value);
        formData.append('subject', document.getElementById('subject').value);
        formData.append('file', document.getElementById('file').files[0]);

        try {
            const response = await fetch('/api/worksheets/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            alert('Worksheet uploaded successfully!');
            this.uploadForm.reset();
            this.loadWorksheets();
        } catch (error) {
            console.error('Error uploading worksheet:', error);
            alert('Failed to upload worksheet. Please try again.');
        }
    }

    async handleFilters() {
        const grade = this.gradeFilter.value;
        const subject = this.subjectFilter.value;
        await this.loadWorksheets(grade, subject);
    }

    async loadWorksheets(grade = '', subject = '') {
        try {
            const queryParams = new URLSearchParams();
            if (grade) queryParams.append('grade', grade);
            if (subject) queryParams.append('subject', subject);

            const response = await fetch(`/api/worksheets?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch worksheets');
            }

            const worksheets = await response.json();
            this.displayWorksheets(worksheets);
        } catch (error) {
            console.error('Error loading worksheets:', error);
            this.worksheetsGrid.innerHTML = '<p class="error">Failed to load worksheets. Please try again later.</p>';
        }
    }

    displayWorksheets(worksheets) {
        this.worksheetsGrid.innerHTML = '';

        if (worksheets.length === 0) {
            this.worksheetsGrid.innerHTML = '<p>No worksheets found.</p>';
            return;
        }

        worksheets.forEach(worksheet => {
            const card = this.createWorksheetCard(worksheet);
            this.worksheetsGrid.appendChild(card);
        });
    }

    createWorksheetCard(worksheet) {
        const card = document.createElement('div');
        card.className = 'worksheet-card';
        card.innerHTML = `
            <div class="worksheet-preview">
                <span class="material-icons">description</span>
            </div>
            <div class="worksheet-info">
                <h3 class="worksheet-title">${this.escapeHtml(worksheet.title)}</h3>
                <div class="worksheet-meta">
                    <span>Grade ${worksheet.grade}</span>
                    <span>${this.capitalizeFirstLetter(worksheet.subject)}</span>
                </div>
                <div class="worksheet-actions">
                    <button onclick="worksheetManager.downloadWorksheet('${worksheet.id}')">Download</button>
                    <button onclick="worksheetManager.deleteWorksheet('${worksheet.id}')">Delete</button>
                </div>
            </div>
        `;
        return card;
    }

    async downloadWorksheet(id) {
        try {
            window.location.href = `/api/worksheets/download/${id}`;
        } catch (error) {
            console.error('Error downloading worksheet:', error);
            alert('Failed to download worksheet. Please try again.');
        }
    }

    async deleteWorksheet(id) {
        if (!confirm('Are you sure you want to delete this worksheet?')) {
            return;
        }

        try {
            const response = await fetch(`/api/worksheets/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete worksheet');
            }

            alert('Worksheet deleted successfully!');
            this.loadWorksheets();
        } catch (error) {
            console.error('Error deleting worksheet:', error);
            alert('Failed to delete worksheet. Please try again.');
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Initialize worksheet manager
const worksheetManager = new WorksheetManager();