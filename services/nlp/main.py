"""
FastAPI NLP Service for Helpro
Provides intent classification, entity extraction, and semantic search
"""
import os
import re
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import rapidfuzz
from rapidfuzz import fuzz

# Optional: sentence-transformers for semantic search (feature-flagged)
USE_SEMANTIC_SEARCH = os.getenv("NLP_USE_SEMANTIC", "false").lower() == "true"

app = FastAPI(
    title="Helpro NLP Service",
    version="1.0.0",
    description="Lightweight NLP for intent classification and entity extraction"
)

# CORS - allow all in dev, restrict in prod
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service start time for uptime calculation
START_TIME = time.time()

# Logging configuration
NLP_LOG_LEVEL = os.getenv("NLP_LOG_LEVEL", "INFO")
NLP_STORE_REQUESTS = os.getenv("NLP_STORE_REQUESTS", "false").lower() == "true"


class Locale(str, Enum):
    EN = "en"
    SV = "sv"
    DE = "de"
    ES = "es"
    FA = "fa"


class Intent(str, Enum):
    BOOK_SERVICE = "BOOK_SERVICE"
    PROVIDER_SIGNUP = "PROVIDER_SIGNUP"
    GENERAL_QA = "GENERAL_QA"
    UNKNOWN = "UNKNOWN"


class AnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    locale: Optional[Locale] = Locale.EN
    request_id: Optional[str] = None


class EntityResult(BaseModel):
    location: Optional[str] = None
    timing: Optional[str] = None
    budget: Optional[str] = None
    hours: Optional[int] = None
    items: Optional[int] = None
    rooms: Optional[int] = None


class KBHit(BaseModel):
    matched: bool = False
    category: Optional[str] = None
    answer_key: Optional[str] = None
    confidence: float = 0.0


class AnalyzeResponse(BaseModel):
    language: Locale
    intent: Intent
    category: Optional[str] = None
    entities: EntityResult
    kb_hit: Optional[KBHit] = None
    confidence: float = Field(ge=0.0, le=1.0)
    request_id: Optional[str] = None


# Language detection patterns
PERSIAN_PATTERN = re.compile(r'[\u0600-\u06FF]')
SWEDISH_PATTERNS = [
    re.compile(r'\b(hej|tjena|hallå|jag|är|behöver|vill|kan|städning|hjälp|flyttning|imorgon|idag)\b', re.I),
]

# Intent keywords (similar to nlp.js but optimized for fuzzy matching)
INTENT_KEYWORDS = {
    Locale.EN: {
        Intent.PROVIDER_SIGNUP: ["become helper", "sign up as", "offer services", "work as", "i want to become"],
        Intent.GENERAL_QA: ["how", "what", "why", "when", "pricing", "price", "cost", "do you have", "does it"],
        Intent.BOOK_SERVICE: ["need", "want", "looking for", "help with", "book", "hire", "cleaning", "moving", "mount", "mounting", "assemble", "assembly"],
    },
    Locale.SV: {
        Intent.PROVIDER_SIGNUP: ["bli hjälpare", "registrera som", "erbjuda tjänster"],
        Intent.GENERAL_QA: ["hur", "vad", "varför", "när", "pris"],
        Intent.BOOK_SERVICE: ["behöver", "vill", "vill ha", "söker", "hjälp med", "boka", "städning", "städa", "flytt", "flyttning", "kan ni", "montering", "montera"],
    },
    Locale.FA: {
        Intent.PROVIDER_SIGNUP: ["همکار شدن", "ثبت نام کنم", "ثبت‌نام", "ثبت نام", "نام نویسی", "ارائه خدمات", "کار کردن"],
        Intent.GENERAL_QA: ["چگونه", "چطور", "چه طور", "چی", "چیه", "چه", "چرا", "کی", "کجا", "چند", "قیمت", "پرداخت", "بیمه"],
        Intent.BOOK_SERVICE: ["نیاز", "می خواهم", "میخواهم", "رزرو", "نظافت", "خدمت", "اسباب کشی", "اسباب‌کشی", "حمل"],
    },
}

# Category keywords
CATEGORY_KEYWORDS = {
    "cleaning": {
        Locale.EN: ["clean", "cleaning", "tidy", "scrub", "vacuum"],
        Locale.SV: ["städ", "städning", "städa", "rengöring"],
        Locale.FA: ["نظافت", "تمیزکردن", "تمیز"],
    },
    "moving-delivery": {
        Locale.EN: ["moving", "move", "delivery", "transport"],
        Locale.SV: ["flytt", "flyttning", "leverans", "transport", "moving"],
        Locale.FA: ["اسباب‌کشی", "اسباب کشی", "حمل", "تحویل"],
    },
    "assembly": {
        Locale.EN: ["assembly", "assemble", "furniture", "ikea"],
        Locale.SV: ["montering", "montera", "möbel", "ikea", "assembly"],
        Locale.FA: ["مونتاژ", "سوار کردن", "مبل"],
    },
    "mounting": {
        Locale.EN: ["mount", "mounting", "install", "hang", "tv", "shelf"],
        Locale.SV: ["montera", "installera", "hänga", "tv", "mounting"],
        Locale.FA: ["نصب", "آویزان کردن", "تلویزیون"],
    },
    "repairs": {
        Locale.EN: ["repair", "fix", "broken", "handyman"],
        Locale.SV: ["reparation", "fixa", "laga", "hantverkare"],
        Locale.FA: ["تعمیر", "تعمیرات", "درست کردن"],
    },
}


def normalize_text(text: str) -> str:
    """Normalize text for Persian/Arabic matching"""
    normalized = text
    # NFKC normalization
    normalized = normalized.replace('\u200c', ' ')  # ZWNJ
    normalized = normalized.replace('ك', 'ک')  # Arabic kaf -> Persian kaf
    normalized = normalized.replace('ي', 'ی')  # Arabic yeh -> Persian yeh
    normalized = re.sub(r'[?؟!.,;:\-()]', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized.strip().lower()


def detect_language(text: str) -> Locale:
    """Detect language from text"""
    if PERSIAN_PATTERN.search(text):
        return Locale.FA

    for pattern in SWEDISH_PATTERNS:
        if pattern.search(text.lower()):
            return Locale.SV

    return Locale.EN


def classify_intent(text: str, locale: Locale) -> tuple[Intent, float]:
    """Classify intent using fuzzy matching"""
    normalized = normalize_text(text)

    # Get keywords for locale
    keywords = INTENT_KEYWORDS.get(locale, INTENT_KEYWORDS[Locale.EN])

    # Check intents in priority order
    for intent in [Intent.PROVIDER_SIGNUP, Intent.GENERAL_QA, Intent.BOOK_SERVICE]:
        if intent in keywords:
            for keyword in keywords[intent]:
                score = fuzz.partial_ratio(normalize_text(keyword), normalized)
                if score >= 85:  # High confidence threshold
                    return intent, score / 100.0

    return Intent.UNKNOWN, 0.0


def match_category(text: str, locale: Locale) -> tuple[Optional[str], float]:
    """Match service category using fuzzy matching"""
    normalized = normalize_text(text)

    best_category = None
    best_score = 0.0

    for category, locale_keywords in CATEGORY_KEYWORDS.items():
        keywords = locale_keywords.get(locale, locale_keywords.get(Locale.EN, []))

        for keyword in keywords:
            score = fuzz.partial_ratio(normalize_text(keyword), normalized)
            if score > best_score:
                best_score = score
                best_category = category

    # Threshold for category match
    if best_score >= 80:
        return best_category, best_score / 100.0

    return None, 0.0


def extract_entities(text: str) -> EntityResult:
    """Extract entities from text"""
    entities = EntityResult()

    # Convert Persian digits to Western
    text_normalized = text
    for i, persian in enumerate('۰۱۲۳۴۵۶۷۸۹'):
        text_normalized = text_normalized.replace(persian, str(i))

    # Hours
    hour_match = re.search(r'([0-9]+)\s*(hour|hr|hours|hrs|timme|timmar|stunde|hora|ساعت)', text_normalized, re.I)
    if hour_match:
        entities.hours = int(hour_match.group(1))

    # Rooms
    room_match = re.search(r'([0-9]+)\s*(room|rooms|bed|bedroom|rum|zimmer|habitación|اتاق|اطاق)', text_normalized, re.I)
    if room_match:
        entities.rooms = int(room_match.group(1))

    # Items
    item_match = re.search(r'([0-9]+)\s*(item|items|sak|artikel|cosa|چیز|مورد)', text_normalized, re.I)
    if item_match:
        entities.items = int(item_match.group(1))

    # Location
    location_match = re.search(
        r'(stockholm|göteborg|malmö|södertälje|uppsala|västerås|örebro|linköping|استکهلم|استوکهلم|گوتبورگ|مالمو)',
        text, re.I
    )
    if location_match:
        entities.location = location_match.group(1)

    # Timing
    timing_match = re.search(
        r'(today|tomorrow|tonight|weekend|idag|imorgon|i\s*morgon|helgen|i\s*helgen|kväll|morgon|امروز|فردا|عصر|صبح|شب)',
        text, re.I
    )
    if timing_match:
        entities.timing = timing_match.group(1)

    # Budget
    budget_match = re.search(r'([0-9]+)\s*(kr|sek|€|eur|\$|usd|تومان|کرون)', text_normalized, re.I)
    if budget_match:
        entities.budget = f"{budget_match.group(1)} {budget_match.group(2)}"

    return entities


@app.get("/health")
async def health():
    """Health check endpoint"""
    uptime = time.time() - START_TIME
    return {
        "ok": True,
        "version": "1.0.0",
        "uptime": round(uptime, 2),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/nlp/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, http_request: Request):
    """Analyze message for intent, category, and entities"""

    # Log request (if enabled and not storing sensitive data)
    if NLP_LOG_LEVEL in ["DEBUG", "INFO"]:
        print(f"[NLP] Request ID: {request.request_id}, Locale: {request.locale}")

    # Detect language
    detected_language = detect_language(request.message)
    effective_locale = detected_language if detected_language != Locale.EN else request.locale or Locale.EN

    # Classify intent
    intent, intent_confidence = classify_intent(request.message, effective_locale)

    # Match category (only for BOOK_SERVICE intent)
    category = None
    category_confidence = 0.0
    if intent == Intent.BOOK_SERVICE:
        category, category_confidence = match_category(request.message, effective_locale)

    # Extract entities
    entities = extract_entities(request.message)

    # Calculate overall confidence
    confidence = max(intent_confidence, category_confidence)

    # KB hit placeholder (can be enhanced with semantic search)
    kb_hit = None

    response = AnalyzeResponse(
        language=effective_locale,
        intent=intent,
        category=category,
        entities=entities,
        kb_hit=kb_hit,
        confidence=confidence,
        request_id=request.request_id
    )

    if NLP_LOG_LEVEL == "DEBUG":
        print(f"[NLP] Response: {response.model_dump_json()}")

    return response


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Helpro NLP",
        "version": "1.0.0",
        "endpoints": ["/health", "/nlp/analyze"]
    }
