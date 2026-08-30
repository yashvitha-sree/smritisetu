"""
adaptive_engine.py — Adjusts game difficulty based on performance
-----------------------------------------------------------------
This is a RULE-BASED engine (no neural network needed for the prototype).
It is transparent: you can read exactly how it makes decisions.

Formula (score 0–100):
  accuracy    × 0.40   ← most important factor
  speed       × 0.25   ← faster is better, but never penalize slow players
  hints       × 0.20   ← fewer hints used = better
  completion  × 0.15   ← did the patient finish the game?

Decision:
  Score ≥ 80 → gently increase difficulty
  Score 50–79 → keep the same difficulty
  Score < 50  → suggest easier difficulty

IMPORTANT: This engine NEVER uses medical language.
It talks about "activity performance", never "cognitive decline".
"""


def calculate_performance_score(
    accuracy: float,
    response_time: int,
    hints_used: int,
    completed: bool,
    difficulty: int = 1
) -> float:
    """
    Calculate a performance score from 0 to 100.
    
    Parameters:
      accuracy      -- percentage correct (0–100)
      response_time -- seconds taken (lower is better, capped at 300s)
      hints_used    -- number of hints used (lower is better, capped at 5)
      completed     -- did the patient finish the game?
      difficulty    -- current difficulty level (1–4)
    
    Returns:
      A float between 0 and 100.
    """

    # ── ACCURACY CONTRIBUTION (40%) ─────────────────────────────
    accuracy_contribution = (accuracy / 100.0) * 40.0

    # ── SPEED CONTRIBUTION (25%) ─────────────────────────────────
    # We use a generous cap: anything under 60 seconds is "fast".
    # Anything over 300 seconds is "slow" but still gets some points.
    # We never penalize heavily — elderly users need time.
    max_time = 300  # 5 minutes is our upper limit
    capped_time = min(response_time, max_time)
    speed_score = max(0, (1 - (capped_time / max_time))) * 100
    speed_contribution = (speed_score / 100.0) * 25.0

    # ── HINT CONTRIBUTION (20%) ──────────────────────────────────
    # 0 hints = full points. 5+ hints = 0 points.
    max_hints = 5
    capped_hints = min(hints_used, max_hints)
    hint_score = max(0, (1 - (capped_hints / max_hints))) * 100
    hint_contribution = (hint_score / 100.0) * 20.0

    # ── COMPLETION CONTRIBUTION (15%) ────────────────────────────
    completion_contribution = 15.0 if completed else 0.0

    # ── TOTAL ────────────────────────────────────────────────────
    total = (
        accuracy_contribution
        + speed_contribution
        + hint_contribution
        + completion_contribution
    )

    return round(total, 2)


def recommend_next_difficulty(
    performance_score: float,
    current_difficulty: int
) -> tuple[int, str]:
    """
    Based on performance score, decide the next difficulty level.
    
    Returns:
      (next_difficulty, friendly_message_for_patient)
    
    IMPORTANT: Messages are always encouraging. Never say "you failed".
    """

    if performance_score >= 80:
        # Great performance — gently increase difficulty (but not above 4)
        next_difficulty = min(current_difficulty + 1, 4)
        if next_difficulty > current_difficulty:
            message = "Great job! Ready for a slightly more engaging activity? 🌟"
        else:
            message = "Wonderful work! You're doing amazing! 🎉"

    elif performance_score >= 50:
        # Good but steady — keep the same difficulty
        next_difficulty = current_difficulty
        message = "Nice work! Let's keep the fun going! 😊"

    else:
        # Lower performance — gently reduce difficulty (but not below 1)
        next_difficulty = max(current_difficulty - 1, 1)
        if next_difficulty < current_difficulty:
            message = "Let's try an easier activity. You've got this! 💙"
        else:
            message = "Let's try another fun activity! 🌈"

    return next_difficulty, message
