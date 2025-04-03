from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import Config
from livereload import Server


app = Flask(__name__)
app.config.from_object(Config)


# Database setup
db = SQLAlchemy(app)
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    class_name = db.Column(db.String(100))
    date = db.Column(db.String(100))
    topic = db.Column(db.String(200))
    main_points = db.Column(db.Text)
    notes = db.Column(db.Text)
    summary = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@app.route("/")
def home():
    notes = Note.query.all()
    return render_template('index.html', notes=notes)

@app.route('/add_note', methods=['POST'])
def add_note():
    note_content = request.form.get('note')
    new_note = Note(title=note_content)
    db.session.add(new_note)
    db.session.commit()

    return f'<li class="list-group-item d-flex justify-content-between align-items-center" data-note-id="{new_note.id}">{note_content}<button class="btn btn-danger btn-sm" onclick="deleteNote(this)">Delete</button></li>'


@app.route('/delete_note/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    
    return '', 204  # No content response

@app.route('/save_note_content/<int:note_id>', methods=['POST'])
def save_note_content(note_id):
    note = Note.query.get_or_404(note_id)
    data = request.json

    note.class_name = data.get('class_name')
    note.date = data.get('date')
    note.topic = data.get('topic')
    note.main_points = data.get('main_points')
    note.notes = data.get('notes')
    note.summary = data.get('summary')

    db.session.commit()

    return '', 204  # No content response

@app.route('/get_note_content/<int:note_id>')
def get_note_content(note_id):
    note = Note.query.get_or_404(note_id)
    return {
        'class_name': note.class_name,
        'date': note.date,
        'topic': note.topic,
        'main_points': note.main_points,
        'notes': note.notes,
        'summary': note.summary
    }


with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.debug = True

    # Create a Livereload server
    server = Server(app.wsgi_app)

    # Watch for changes in templates and static files
    server.watch('templates/**/*.html')  # Watch all HTML files in templates folder
    server.watch('static/**/*.css')      # Watch all CSS files in static folder
    server.watch('app.py')               # Watch the app.py file for changes

    # Start the server
    server.serve(port=5000, host='127.0.0.1')