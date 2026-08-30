"""
recommendation_engine.py — Suggests the next activity for a patient
---------------------------------------------------------------------
Analyses recent game session history and recommends which game category
to try next, based on engagement levels.

IMPORTANT: This engine talks about "activity performance" ONLY.
It never diagnoses conditions or uses medical terminology.

How it works:
  1. Map each game to a cognitive category (Memory, Attention, etc.)
  2. Average the last 5 sessions per category
  3. Find the category with the LOWEST average accuracy
  4. Recommend an activity from that category

This encourages balanced engagement across all activity types.
"""

from database import get_db

# Map game slugs to cognitive categories
GAME_CATEGORIES = {
    "memory-match":    "auditory",   # card matching = auditory/visual memory
    "musical-memory":  "auditory",
    "word-search":     "language",
    "retro-trivia":    "memory",
    "spot-odd-one-out": "attention",
}

# Map categories back to recommended games
CATEGORY_TO_GAME = {
    "memory":    ("retro-trivia",    "Retro Trivia",     "💭"),
    "attention": ("spot-odd-one-out", "Spot the Odd One", "🔍"),
    "visual":    ("memory-match",    "Memory Match",     "🧩"),
    "auditory":  ("musical-memory",  "Musical Memory",   "🎵"),
    "language":  ("word-search",     "Word Search",      "🔤"),
}

# Friendly descriptions for each category
CATEGORY_DESCRIPTIONS = {
    "memory":    "Memory activities",
    "attention": "Attention activities",
    "visual":    "Visual activities",
    "auditory":  "Auditory activities",
    "language":  "Language activities",
}


def get_category_scores(patient_id: str) -> dict[str, float]:
    """
    Returns average accuracy per category from the last 5 sessions each.
    If a category has no sessions, returns 50.0 as a neutral default.
    """
    conn = get_db()
    cursor = conn.cursor()

    scores = {}

    for game_slug, category in GAME_CATEGORIES.items():
        if category in scores:
            continue  # Already computed this category

        # Get last 5 sessions for this category's games
        # Find all games that map to this category
        games_in_category = [g for g, c in GAME_CATEGORIES.items() if c == category]
        placeholders = ",".join(["?" for _ in games_in_category])

        rows = cursor.execute(f"""
            SELECT accuracy FROM game_sessions
            WHERE patient_id = ?
              AND game IN ({placeholders})
            ORDER BY timestamp DESC
            LIMIT 5
        """, [patient_id] + games_in_category).fetchall()

        if rows:
            avg = sum(row["accuracy"] for row in rows) / len(rows)
        else:
            avg = 50.0  # Neutral default for new patients

        scores[category] = round(avg, 1)

    # Ensure all categories have a value
    for category in CATEGORY_TO_GAME.keys():
        if category not in scores:
            scores[category] = 50.0

    conn.close()
    return scores


def get_recommendation(patient_id: str) -> dict:
    """
    Returns the recommended next activity for the patient.
    
    Returns a dict with:
      game_slug    -- the game to open
      game_title   -- display name
      game_icon    -- emoji icon
      reason       -- why this is recommended (activity language, not medical)
      scores       -- all category scores for display
    """
    scores = get_category_scores(patient_id)

    # Find the category with the lowest engagement
    lowest_category = min(scores, key=scores.get)
    lowest_score = scores[lowest_category]

    game_slug, game_title, game_icon = CATEGORY_TO_GAME[lowest_category]
    category_label = CATEGORY_DESCRIPTIONS[lowest_category]

    # Generate a friendly (non-medical) reason
    if lowest_score < 60:
        reason = f"{category_label} have had lower engagement recently. Give it a try!"
    elif lowest_score < 75:
        reason = f"Try a {category_label.lower()} activity for a balanced session today."
    else:
        reason = f"You're doing great overall! A {category_label.lower()} activity could be fun next."

    return {
        "game_slug": game_slug,
        "game_title": game_title,
        "game_icon": game_icon,
        "reason": reason,
        "scores": scores,
    }


def get_ai_insights(patient_id: str) -> list[str]:
    """
    Returns a list of friendly text insights about recent activity.
    These are shown on the caregiver dashboard.
    
    IMPORTANT: Uses activity language ONLY. Never medical language.
    """
    scores = get_category_scores(patient_id)
    insights = []

    for category, score in scores.items():
        label = CATEGORY_DESCRIPTIONS[category]
        if score >= 80:
            insights.append(
                f"{label} have shown strong engagement in recent sessions."
            )
        elif score >= 60:
            insights.append(
                f"{label} have been steady in recent sessions."
            )
        else:
            insights.append(
                f"{label} have had lower engagement recently. "
                f"A gentle activity in this area may be enjoyable."
            )

    return insights
