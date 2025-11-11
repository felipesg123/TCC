// Complete filter functionality fix for atividades.html

// DOM Elements
const filterBtn = document.getElementById('filter-btn');
const filterModal = document.getElementById('filter-modal');
const closeFilter = document.getElementById('close-filter');
const applyFiltersBtn = document.getElementById('apply-modal-filters');
const clearFiltersBtn = document.getElementById('clear-modal-filters');

// Filter inputs
const categoryFilter = document.getElementById('modal-category-filter');
const difficultyFilter = document.getElementById('modal-difficulty-filter');
const searchFilter = document.getElementById('modal-search-filter');

// Current filter state
let currentFilters = {
    category: 'all',
    difficulty: 'all',
    search: ''
};

// Initialize filter functionality
function initFilters() {
    // Ensure modal starts closed
    filterModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Setup event listeners
    filterBtn.addEventListener('click', openFilterModal);
    closeFilter.addEventListener('click', closeFilterModal);
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Close modal when clicking outside
    filterModal.addEventListener('click', (e) => {
        if (e.target === filterModal) {
            closeFilterModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filterModal.classList.contains('active')) {
            closeFilterModal();
        }
    });
}

// Open filter modal
function openFilterModal() {
    filterModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close filter modal
function closeFilterModal() {
    filterModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Apply filters
function applyFilters() {
    currentFilters = {
        category: categoryFilter.value,
        difficulty: difficultyFilter.value,
        search: searchFilter.value.toLowerCase()
    };
    
    applyCurrentFilters();
    closeFilterModal();
}

// Clear all filters
function clearFilters() {
    categoryFilter.value = 'all';
    difficultyFilter.value = 'all';
    searchFilter.value = '';
    
    currentFilters = {
        category: 'all',
        difficulty: 'all',
        search: ''
    };
    
    applyCurrentFilters();
}

// Apply current filters to activities
function applyCurrentFilters() {
    const activities = window.activities || [];
    let filteredActivities = activities.filter(activity => {
        const matchesCategory = currentFilters.category === 'all' || activity.category === currentFilters.category;
        const matchesDifficulty = currentFilters.difficulty === 'all' || activity.difficulty === currentFilters.difficulty;
        const matchesSearch = currentFilters.search === '' || 
            activity.title.toLowerCase().includes(currentFilters.search) ||
            activity.description.toLowerCase().includes(currentFilters.search);
        
        return matchesCategory && matchesDifficulty && matchesSearch;
    });
    
    renderActivities(filteredActivities);
}

// Enhanced render function
function renderActivities(activitiesToRender) {
    const container = document.getElementById('activities-container');
    const noResults = document.getElementById('no-results');
    
    if (!container) return;
    
    if (activitiesToRender.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    container.innerHTML = activitiesToRender.map(activity => `
        <div class="activity-wrapper">
            <h3 class="activity-title">${activity.title}</h3>
            <div class="activity-card" data-id="${activity.id}">
                <div class="activity-content">
                    <i class="${activity.icon} activity-icon"></i>
                    <p class="activity-name">${activity.description}</p>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${activity.progress}%"></div>
            </div>
            <div class="activity-meta">
                <span class="category-badge">${getCategoryName(activity.category)}</span>
                <span class="difficulty-badge">${getDifficultyName(activity.difficulty)}</span>
            </div>
        </div>
    `).join('');
}

// Helper functions
function getCategoryName(category) {
    const categories = {
        'alfabetizacao': 'Alfabetização',
        'matematica': 'Matemática',
        'cidadania': 'Cidadania',
        'leitura': 'Leitura',
        'escrita': 'Escrita'
    };
    return categories[category] || category;
}

function getDifficultyName(difficulty) {
    const difficulties = {
        'iniciante': 'Iniciante',
        'intermediario': 'Intermediário',
        'avancado': 'Avançado'
    };
    return difficulties[difficulty] || difficulty;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    applyCurrentFilters();
});
