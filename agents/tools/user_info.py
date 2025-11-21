import os
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel, Field, create_engine, Session, select
from langchain.tools import tool


# ---------- 1. SQLModel definition ----------

class User(SQLModel, table=True):
    __tablename__ = "user"

    id: UUID = Field(primary_key=True)
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    goals: Optional[str] = None
    favourite_foods: Optional[str] = None
    feedback_summary: Optional[str] = None


# ---------- 2. Database Engine ----------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)

# Create tables if not exist
SQLModel.metadata.create_all(engine)


# ---------- 3. LangChain Tool ----------

@tool(
    description=(
        "Retrieve a user's information from the PostgreSQL database using their UUID as input. "
        "Input: user_id (str, UUID format). "
        "Output: a dictionary containing user fields such as id, name, age, gender, height, weight, goals, favourite_foods, feedback_summary, "
        "or an error message."
    ),
)
def get_user_info_by_user_id(user_id: str) -> dict:
    """
    Get a user from the PostgreSQL database by their UUID.

    Args:
        user_id: UUID of the user

    Returns:
        User information as a dictionary, or an error message.
    """
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        return {"error": "Invalid UUID format"}

    with Session(engine) as session:
        statement = select(User).where(User.id == user_uuid)
        user = session.exec(statement).first()

        if not user:
            return {"error": "User not found"}

        return {
            "id": str(user.id),
            "name": user.name,
            "age": user.age,
            "gender": user.gender,
            "height": user.height,
            "weight": user.weight,
            "goals": user.goals,
            "favourite_foods": user.favourite_foods,
            "feedback_summary": user.feedback_summary,
        }

