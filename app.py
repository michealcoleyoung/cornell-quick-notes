from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

# Database setup
DB_PATH = 'notes.db'

def init_db():
    connect = sqlite3.connect(DB_PATH)
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
    connect.close()


@app.route("/")
def home():
    return render_template('index.html')

@app.route('/add_note', methods=['POST'])
def add_note():
    print(request.form)
    if 'note' not in request.form:
        return "No note content provided", 400
    note_content = request.form['note']
    connectdb = sqlite3.connect(DB_PATH)
    cursor = connectdb.cursor()
    cursor.execute('INSERT INTO notes (notes) VALUES (?)', (note_content,))
    connectdb.commit()
    connectdb.close()
    return f'<li class="list-group-item">{note_content}</li>'

if __name__ == '__main__':
    init_db()
    app.run(debug=True)