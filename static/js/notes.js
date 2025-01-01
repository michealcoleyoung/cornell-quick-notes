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

      } else {
        console.error('Failed to delete note');
      }
    })
    .catch(error => console.error('Error:', error))
}