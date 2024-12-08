from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)

# Database setup
DB_PATH = 'notes.db'

def init_db():
    with sqlite3.connect(DB_PATH) as connect:
        cursor = connect.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class TEXT,
                date TEXT,
                topic TEXT,
                main_points TEXT,
                notes TEXT,
                summary TEXT
            )
        ''')
        connect.commit()

def execute_db_query(query, args=(), fetchone=False):
    with sqlite3.connect(DB_PATH) as connect:
        cursor = connect.cursor()
        cursor.execute(query, args)
        connect.commit()
        return cursor.fetchone() if fetchone else None

@app.route("/")
def home():
    return render_template('index.html')

@app.route('/add_note', methods=['POST'])
def add_note():
    note_content = request.form.get('note')
    class_name = request.form.get('class', '')
    date = request.form.get('date', '')
    topic = request.form.get('topic', '')
    main_points = request.form.get('main_points', '')
    summary = request.form.get('summary', '')

    execute_db_query('''
        INSERT INTO notes (class, date, topic, main_points, notes, summary)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (class_name, date, topic, main_points, note_content, summary))

    return f'<li class="list-group-item">{note_content}</li>'

@app.route('/delete_note/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    execute_db_query('DELETE FROM notes WHERE id = ?', (note_id,))
    return '', 204  # No content response

if __name__ == '__main__':
    init_db()
    app.run(debug=True)