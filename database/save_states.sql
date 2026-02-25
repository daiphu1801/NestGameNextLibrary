-- ========================================
-- Save States Table
-- Stores emulator save state data per user per game per slot
-- ========================================

CREATE TABLE IF NOT EXISTS save_states (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    slot INTEGER NOT NULL CHECK (slot >= 1 AND slot <= 3),
    state_data BYTEA NOT NULL,
    thumbnail BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_save_states_user_game ON save_states(user_id, game_id);
