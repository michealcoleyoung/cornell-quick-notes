class Config:
    SECRET_KEY = 'key goes here'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///notes.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False