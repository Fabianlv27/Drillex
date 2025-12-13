from typing import List, Optional
from pydantic import BaseModel, Field


class Definition(BaseModel):
    definition: str
    example: Optional[str] = None
    synonyms: Optional[List[str]] = Field(default_factory=list)
    antonyms: Optional[List[str]] = Field(default_factory=list)
    formality: Optional[str] = None
    usageFrequency: Optional[str] = None


class Conjugations(BaseModel):
    past: Optional[str] = None
    presentParticiple: Optional[str] = None
    thirdPerson: Optional[str] = None


class Entry(BaseModel):
    partOfSpeech: str
    definitions: List[Definition]
    conjugations: Optional[Conjugations] = None


class WordModel(BaseModel):
    word: str
    pronunciation: Optional[str] = None
    entries: List[Entry]
    derivedTerms: Optional[List[str]] = Field(default_factory=list)
    relatedForms: Optional[List[str]] = Field(default_factory=list)
    etymology: Optional[str] = None


class WordsModel(BaseModel):
    words: List[WordModel]
