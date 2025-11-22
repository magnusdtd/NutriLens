
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, create_engine
import os

# User table
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


# Images table
class Image(SQLModel, table=True):
    __tablename__ = "images"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)

    bucket: str
    file_name: str
    upload_time: datetime = Field(default_factory=datetime.utcnow)


# Conversations table
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)

    chat_name: str = Field(default="New chat")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    summary: Optional[str] = None


# Messages table
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)

    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)

    timestamp: datetime = Field(default_factory=datetime.utcnow)
    role: str = Field(index=True, description="user / assistant")
    message: str

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)

# Create tables if not exist
SQLModel.metadata.create_all(engine)
