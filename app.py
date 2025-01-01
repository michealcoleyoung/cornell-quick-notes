from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import Config


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

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)