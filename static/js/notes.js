let currentNoteId = null;
let mainPointsEditor, notesEditor, summaryEditor;

// Initialize SimpleMDE editors
function initializeEditors() {
    mainPointsEditor = new SimpleMDE({ 
        element: document.getElementById("main-points-editor"),
        spellChecker: false,
        status: false
    });
    notesEditor = new SimpleMDE({ 
        element: document.getElementById("notes-editor"),
        spellChecker: false,
        status: false
    });
    summaryEditor = new SimpleMDE({ 
        element: document.getElementById("summary-editor"),
        spellChecker: false,
        status: false
    });

    // Add auto-save functionality
    const debouncedSave = debounce(() => saveNoteContent(), 1000);
    [mainPointsEditor, notesEditor, summaryEditor].forEach(editor => {
        editor.codemirror.on("change", debouncedSave);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function addNote() {
    const noteInput = document.getElementById('note');
    const noteContent = noteInput.value;

    if (!noteContent.trim()) return false;

    fetch('/add_note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `note=${encodeURIComponent(noteContent)}`
    })
    .then(response => response.text())
    .then(html => {
        const notesList = document.getElementById('notes-list');
        notesList.insertAdjacentHTML('beforeend', html);
        noteInput.value = '';
        
        // Get the new note's ID and trigger click
        const newNote = notesList.lastElementChild;
        const noteId = newNote.getAttribute('data-note-id');
        loadNoteContent(noteId);
    })
    .catch(error => console.error('Error:', error));
    return false;
}

function deleteNote(button) {
    const noteItem = button.closest('.list-group-item');
    const noteId = noteItem.getAttribute('data-note-id');

    fetch(`/delete_note/${noteId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            noteItem.remove();
            if (currentNoteId === parseInt(noteId)) {
                clearEditors();
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

function saveNoteContent() {
    if (!currentNoteId) return;

    const indicator = document.getElementById('saving-indicator');
    indicator.style.display = 'block';

    const data = {
        class_name: document.getElementById('class').value,
        date: document.getElementById('date').value,
        topic: document.getElementById('topic').value,
        main_points: mainPointsEditor.value(),
        notes: notesEditor.value(),
        summary: summaryEditor.value()
    };

    fetch(`/save_note_content/${currentNoteId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        indicator.style.backgroundColor = '#28a745';
        indicator.textContent = 'Saved!';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 1000);
    })
    .catch(error => {
        console.error('Error:', error);
        indicator.style.backgroundColor = '#dc3545';
        indicator.textContent = 'Error saving!';
    });
}

function loadNoteContent(noteId) {
    // Remove active class from all notes
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected note
    const selectedNote = document.querySelector(`.note-item[data-note-id="${noteId}"]`);
    if (selectedNote) {
        selectedNote.classList.add('active');
    }

    currentNoteId = noteId;
    fetch(`/get_note_content/${noteId}`)
        .then(response => response.json())
        .then(data => {
            // Update form fields
            document.getElementById('class').value = data.class_name || '';
            document.getElementById('date').value = data.date || '';
            document.getElementById('topic').value = data.topic || '';
            
            // Update SimpleMDE editors
            mainPointsEditor.value(data.main_points || '');
            notesEditor.value(data.notes || '');
            summaryEditor.value(data.summary || '');
            
            // Enable inputs
            document.getElementById('class').disabled = false;
            document.getElementById('date').disabled = false;
            document.getElementById('topic').disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load note content');
        });
}

function clearEditors() {
    // Remove active class from all notes
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });

    currentNoteId = null;
    document.getElementById('class').value = '';
    document.getElementById('date').value = '';
    document.getElementById('topic').value = '';
    mainPointsEditor.value('');
    notesEditor.value('');
    summaryEditor.value('');
    
    // Disable inputs
    document.getElementById('class').disabled = true;
    document.getElementById('date').disabled = true;
    document.getElementById('topic').disabled = true;
}

// Update the event listener initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeEditors();
    
    // Add click event listeners to note items
    document.getElementById('notes-list').addEventListener('click', function(e) {
        const noteItem = e.target.closest('.note-item');
        if (noteItem && !e.target.classList.contains('delete-btn')) {
            const noteId = noteItem.getAttribute('data-note-id');
            loadNoteContent(noteId);
        }
    });

    // Add new note item click handler
    document.addEventListener('note-added', function(e) {
        const newNoteItem = document.querySelector(`.note-item[data-note-id="${e.detail.noteId}"]`);
        if (newNoteItem) {
            newNoteItem.click();
        }
    });
});