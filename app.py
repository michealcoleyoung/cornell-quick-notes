from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import Config
from livereload import Server

app = Flask(__name__)
app.config.from_object(Config)
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
    title = request.form.get('note')
    if title:
        new_note = Note(title=title)
        db.session.add(new_note)
        db.session.commit()
        return render_template('note_item.html', note=new_note)
    return 'Error: Note title required', 400

@app.route('/delete_note/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/save_note_content/<int:note_id>', methods=['POST'])
def save_note_content(note_id):
    note = Note.query.get_or_404(note_id)
    data = request.json
    
    note.class_name = data.get('class_name', note.class_name)
    note.date = data.get('date', note.date)
    note.topic = data.get('topic', note.topic)
    note.main_points = data.get('main_points', note.main_points)
    note.notes = data.get('notes', note.notes)
    note.summary = data.get('summary', note.summary)
    
    db.session.commit()
    return jsonify({'success': True})

@app.route('/get_note_content/<int:note_id>')
def get_note_content(note_id):
    note = Note.query.get_or_404(note_id)
    return jsonify({
        'class_name': note.class_name,
        'date': note.date,
        'topic': note.topic,
        'main_points': note.main_points,
        'notes': note.notes,
        'summary': note.summary
    })

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.debug = True
    server = Server(app.wsgi_app)
    server.watch('templates/**/*.html')
    server.watch('static/**/*.css')
    server.watch('app.py')
    server.serve(port=5000, host='127.0.0.1')