"""Add the version-one schema to the selected Neon development branch."""
from database import Base, engine

if __name__ == "__main__":
    Base.metadata.create_all(engine(migration=True))
    print("Neon recruitment schema is ready.")
