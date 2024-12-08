function addNote() {
  const noteInput = document.getElementById('note');
  const noteContent = noteInput.value;

  // Create a new list item for the note
  const newNote = document.createElement('li');
  newNote.className = 'list-group-item d-flex justify-content-between align-items-center';
  newNote.innerHTML = `${noteContent} <button class="btn btn-danger btn-sm" onclick="deleteNote(this)">Delete</button>`;

  // Append the new note to the list
  const notesList = document.getElementById('notes-list');
  notesList.classList.remove('hidden'); // Show the list if hidden
  notesList.appendChild(newNote);

  // Clear the input field
  noteInput.value = '';

  return false; // Prevent form submission
}

function deleteNote(button) {
  const noteItem = button.parentElement;
  noteItem.remove();
}