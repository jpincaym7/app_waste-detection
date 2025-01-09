// comments.js
document.addEventListener('DOMContentLoaded', function() {
    initializeComments();
});

function initializeComments() {
    document.querySelectorAll('.toggle-comments').forEach(button => {
        button.addEventListener('click', function() {
            const commentsContainer = this.closest('.comments-section').querySelector('.comments-container');
            const icon = this.querySelector('i');
            
            if (commentsContainer.classList.contains('hidden')) {
                commentsContainer.classList.remove('hidden');
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                loadComments(this.closest('.report-card').dataset.reportId);
            } else {
                commentsContainer.classList.add('hidden');
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        });
    });

    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', handleCommentSubmit);
    });

    // Auto-expand textarea
    document.querySelectorAll('.comment-form textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
}

async function loadComments(reportId) {
    try {
        const response = await fetch(`/gamification/api/reports/${reportId}/comments/`);
        const comments = await response.json();
        
        const commentsContainer = document.querySelector(`[data-report-id="${reportId}"] .comments-list`);
        commentsContainer.innerHTML = '';
        
        comments.forEach(comment => {
            commentsContainer.appendChild(createCommentElement(comment));
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function createCommentElement(comment) {
    const template = document.getElementById('comment-template');
    const element = template.content.cloneNode(true);
    
    element.querySelector('.font-medium').textContent = comment.user;
    element.querySelector('.text-gray-500').textContent = formatDate(comment.created_at);
    element.querySelector('.text-gray-700').textContent = comment.content;
    
    return element;
}

async function handleCommentSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const reportId = form.closest('.report-card').dataset.reportId;
    const textarea = form.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) return;
    
    try {
        const response = await fetch(`/gamification/api/reports/${reportId}/comments/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            const comment = await response.json();
            const commentsContainer = form.nextElementSibling;
            commentsContainer.insertBefore(createCommentElement(comment), commentsContainer.firstChild);
            
            textarea.value = '';
            textarea.style.height = 'auto';
        } else {
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}