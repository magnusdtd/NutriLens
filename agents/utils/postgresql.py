
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, create_engine
from sqlalchemy import MetaData, inspect
import os

# Use a single, global MetaData instance and pass extend_existing=True in __table_args__
metadata = MetaData()

# User table
class User(SQLModel, table=True, metadata=metadata):
    __tablename__ = "user"
    __table_args__ = {"extend_existing": True}

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
class Image(SQLModel, table=True, metadata=metadata):
    __tablename__ = "images"
    __table_args__ = {"extend_existing": True}

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)

    bucket: str
    file_name: str
    upload_time: datetime = Field(default_factory=datetime.utcnow)

# Conversations table
class Conversation(SQLModel, table=True, metadata=metadata):
    __tablename__ = "conversations"
    __table_args__ = {"extend_existing": True}

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)

    chat_name: str = Field(default="New chat")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    summary: Optional[str] = None

# Messages table
class Message(SQLModel, table=True, metadata=metadata):
    __tablename__ = "messages"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)

    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)

    timestamp: datetime = Field(default_factory=datetime.utcnow)
    role: str = Field(index=True, description="user / assistant")
    message: str

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)

inspector = inspect(engine)
table_names = inspector.get_table_names()

# Only create tables if they don't already exist
required_tables = ["user", "images", "conversations", "messages"]
tables_missing = any(table not in table_names for table in required_tables)

if tables_missing:
    # Add extend_existing=True to metadata.create_all to allow redefining tables if needed
    metadata.create_all(engine, checkfirst=True)
