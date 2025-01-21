let currentNoteId = null; // Track the currently selected note

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
  const data = {
    class_name: document.getElementById('class').value,
    date: document.getElementById('date').value,
    topic: document.getElementById('topic').value,
    main_points: document.getElementById('main-points').value,
    notes: document.getElementById('notes').value,
    summary: document.getElementById('summary').value
  };


  fetch(`/save_note_content/${noteId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
.catch(error => console.error('Error saving note:', error));
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

  // Enable all form fields
  const formFields = ['class', 'date', 'topic', 'main-points', 'notes', 'summary'];

  formFields.forEach(fieldId => {
    document.getElementById(fieldId).disabled = false;
  });

  fetch(`/get_note_content/${noteId}`)
  .then(response => response.json())
  .then(data => {
    document.getElementById('class').value = data.class_name || '';
    document.getElementById('date').value = data.date || '';
    document.getElementById('topic').value = data.topic || '';
    document.getElementById('main-points').value = data.main_points || '';
    document.getElementById('notes').value = data.notes || '';
    document.getElementById('summary').value = data.summary || '';
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
  // Get all form fields
  const formFields = [
    'class',
    'date',
    'topic',
    'main-points',
    'notes',
    'summary'
    
  ];

  // Add change listeners to all fields
  formFields.forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('change', function() {
      if(currentNoteId) {
        saveNoteContent(currentNoteId);
      }
    });
  });

  const existingNotes = document.querySelectorAll('#notes-list li');
  existingNotes.forEach(note => {
    note.addEventListener('click', function(e) {
      if (e.target !== this) return; // Ignore clicks on child elements
      loadNoteContent(this.getAttribute('data-note-id'));
    })
  })
});