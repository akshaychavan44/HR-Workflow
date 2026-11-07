import os
from contextlib import contextmanager
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import ForeignKey, LargeBinary, String, Text, UniqueConstraint, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

load_dotenv(Path(__file__).parent / ".env")


class Base(DeclarativeBase):
    pass


class JobRecord(Base):
    __tablename__ = "hr_jobs"
    id: Mapped[str] = mapped_column(String(200), primary_key=True)
    data: Mapped[str] = mapped_column(Text)


class CandidateRecord(Base):
    __tablename__ = "hr_candidates"
    __table_args__ = (UniqueConstraint("job_id", "digest"),)
    id: Mapped[str] = mapped_column(String(200), primary_key=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("hr_jobs.id"), index=True)
    digest: Mapped[str] = mapped_column(String(64))
    data: Mapped[str] = mapped_column(Text)
    content: Mapped[bytes] = mapped_column(LargeBinary)


@lru_cache
def engine(migration=False):
    key = "DATABASE_URL_UNPOOLED" if migration else "DATABASE_URL"
    url = os.environ.get(key)
    if not url:
        raise RuntimeError(f"Set {key} in backend/.env to connect Neon.")
    url = url.replace("postgres://", "postgresql+psycopg://", 1).replace("postgresql://", "postgresql+psycopg://", 1)
    if not url.startswith("postgresql+psycopg://"):
        raise RuntimeError("A Postgres connection URL is required.")
    return create_engine(url, pool_pre_ping=True, pool_size=3, max_overflow=2,
                         connect_args={"sslmode": "require", "connect_timeout": 15})


@contextmanager
def db():
    with Session(engine()) as session:
        with session.begin():
            yield session
