let currentNoteId = null; // Track the currently selected note

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

  if (!noteContent.trim()) {
    console.error('Note content cannot be empty');
    return false;
  }

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
      notesList.classList.remove('hidden');
      notesList.insertAdjacentHTML('beforeend', html);
  noteInput.value = '';

      const  newNote = notesList.lastElementChild;
      newNote.addEventListener('click', function(e) {
        if (e.target !== this) return; // Ignore clicks on child elements
        loadNoteContent(this.getAttribute('data-note-id'));
      })
    }).catch(error => console.error('Error:', error));
  return false;

}

function deleteNote(button) {
  const noteItem = button.parentElement;
  const noteId = noteItem.getAttribute('data-note-id');

  fetch(`/delete_note/${noteId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
  noteItem.remove();

        // Clear and disable form fields
        const formFields = ['class', 'date', 'topic', 'main-points', 'notes', 'summary'];

        formFields.forEach(fieldId => {
          const field = document.getElementById(fieldId);
          field.value = '';
          field.disabled = true;
        });
        currentNoteId = null;

      } else {
        console.error('Failed to delete note');
      }
    })
    .catch(error => console.error('Error:', error));
}

function saveNoteContent(noteId) {
    const indicator = document.getElementById('saving-indicator');
    indicator.style.display = 'block';
    indicator.textContent = 'Saving...';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    fetch(`/save_note_content/${noteId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            class_name: document.getElementById('class').value,
            date: document.getElementById('date').value,
            topic: document.getElementById('topic').value,
            main_points: mainPointsEditor.root.innerHTML,
            notes: notesEditor.root.innerHTML,
            summary: summaryEditor.root.innerHTML
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save');
        }
        indicator.textContent = 'Saved!';
        indicator.style.backgroundColor = '#198754';  // Success green
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 1000);
    })
    .catch(error => {
        console.error('Error saving note:', error);
        indicator.textContent = 'Error saving!';
        indicator.style.backgroundColor = '#dc3545';  // Danger red
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    });
}

function loadNoteContent(noteId) {

  // Remove highlight from previously selected note
  document.querySelectorAll('#notes-list li').forEach(note => {
    note.classList.remove('selected-note');
  });

  // Add highlight to current note
  const selectedNote = document.querySelector(`li[data-note-id="${noteId}"]`);

  if(selectedNote) {
    selectedNote.classList.add('selected-note');
  }

  currentNoteId = noteId;

  // Enable form fields
  ['class', 'date', 'topic'].forEach(fieldId => {
    document.getElementById(fieldId).disabled = false;
  });

  fetch(`/get_note_content/${noteId}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('class').value = data.class_name || '';
      document.getElementById('date').value = data.date || '';
      document.getElementById('topic').value = data.topic || '';
      mainPointsEditor.root.innerHTML = data.main_points || '';
      notesEditor.root.innerHTML = data.notes || '';
      summaryEditor.root.innerHTML = data.summary || '';
    })
    .catch(error => console.error('Error loading note:', error));
}


function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');  // Returns MM/DD/YYYY
}



function getDateValue(formattedDate) {
    if (!formattedDate) return '';
    const date = new Date(formattedDate);
    return date.toISOString().split('T')[0];  // Returns YYYY-MM-DD for input
}
  

document.addEventListener('DOMContentLoaded', function () {
    // Form field listeners
    ['class', 'date', 'topic'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', function() {
            if(currentNoteId) {
                saveNoteContent(currentNoteId);
            }
        });
    });

    // Quill editor listeners
    [mainPointsEditor, notesEditor, summaryEditor].forEach(editor => {
        editor.on('text-change', debounce(() => {
            if(currentNoteId) {
                saveNoteContent(currentNoteId);
            }
        }, 1000));
    });

    // Add click handlers for existing notes
    const existingNotes = document.querySelectorAll('#notes-list li');
    existingNotes.forEach(note => {
        note.addEventListener('click', function(e) {
            if (e.target !== this) return; // Ignore clicks on child elements
            loadNoteContent(this.getAttribute('data-note-id'));
        });
    });
});

// Add character/line limits
const LIMITS = {
    mainPoints: 1000,  // Adjust these numbers
    notes: 2000,
    summary: 500
};

// Add content monitoring
function checkContentLimits(editor, limit) {
    const length = editor.getText().length;
    const container = editor.container.querySelector('.ql-editor');
    
    if (length >= limit * 0.9) {  // At 90% capacity
        container.classList.add('near-limit');
    }
    if (length >= limit) {  // At full capacity
        container.classList.add('at-limit');
        return false;  // Prevent more input
    }
    return true;
}