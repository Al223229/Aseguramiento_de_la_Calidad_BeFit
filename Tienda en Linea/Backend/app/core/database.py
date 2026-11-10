import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

_default_db_path = Path(__file__).resolve().parents[2] / "befit.db"
_database_url = os.getenv("DATABASE_URL")
if _database_url:
    DATABASE_URL = _database_url
    _connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(DATABASE_URL, connect_args=_connect_args)
else:
    DATABASE_URL = URL.create("sqlite", database=str(_default_db_path))
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
