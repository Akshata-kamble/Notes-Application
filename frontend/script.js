// Configuration: Replace with your actual backend URL after deployment
const API_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('add-note-form');
    const notesContainer = document.getElementById('notes-container');

    // Fetch and display notes on page load
    fetchNotes();

    // Handle form submission to add a new note
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const submitBtn = document.getElementById('add-btn');

        const title = titleInput.value;
        const content = contentInput.value;

        // Disable button to prevent double clicks
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';

        try {
            const response = await fetch(`${API_BASE_URL}/add-note`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                // Clear inputs and refresh notes list
                titleInput.value = '';
                contentInput.value = '';
                await fetchNotes();
            } else {
                alert('Failed to add note. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Cannot connect to the server.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Note';
        }
    });

    /**
     * Fetches all notes from the backend and renders them.
     */
    async function fetchNotes() {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`);
            const notes = await response.json();

            // Clear container
            notesContainer.innerHTML = '';

            if (notes.length === 0) {
                notesContainer.innerHTML = '<p class="loading-text">No notes found. Start by adding one above!</p>';
                return;
            }

            // Create cards for each note
            notes.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card';

                const formattedDate = new Date(note.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

                noteCard.innerHTML = `
                    <div>
                        <h3>${escapeHTML(note.title)}</h3>
                        <p>${escapeHTML(note.content)}</p>
                    </div>
                    <div class="note-footer">
                        <span class="note-date">${formattedDate}</span>
                        <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
                    </div>
                `;
                notesContainer.appendChild(noteCard);
            });
        } catch (error) {
            console.error('Error fetching notes:', error);
            notesContainer.innerHTML = '<p class="loading-text">Error connecting to backend.</p>';
        }
    }

    /**
     * Utility to prevent XSS attacks when displaying user-generated content
     */
    function escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }

    // Global function for handling note removal
    window.deleteNote = async (id) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchNotes(); // Refresh the list
            } else {
                alert('Failed to delete note.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error while deleting.');
        }
    };
});
