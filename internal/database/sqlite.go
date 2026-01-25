package database

import (
	"database/sql"
	"errors"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"sora2api-go/internal/models"
)

var ErrNotFound = errors.New("record not found")

type DB struct {
	conn *sql.DB
}

func NewDB(path string) (*DB, error) {
	conn, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}
	if err := conn.Ping(); err != nil {
		return nil, err
	}
	return &DB{conn: conn}, nil
}

func (db *DB) Close() error {
	return db.conn.Close()
}

func (db *DB) InitSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS tokens (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		token TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL,
		name TEXT DEFAULT '',
		session_token TEXT,
		refresh_token TEXT,
		client_id TEXT,
		proxy_url TEXT,
		remark TEXT,
		is_active BOOLEAN DEFAULT 1,
		is_expired BOOLEAN DEFAULT 0,
		cooled_until DATETIME,
		image_enabled BOOLEAN DEFAULT 1,
		video_enabled BOOLEAN DEFAULT 1,
		image_concurrency INTEGER DEFAULT -1,
		video_concurrency INTEGER DEFAULT -1,
		plan_type TEXT,
		plan_title TEXT,
		subscription_end DATETIME,
		sora2_supported BOOLEAN DEFAULT 0,
		sora2_invite_code TEXT,
		sora2_used_count INTEGER DEFAULT 0,
		sora2_total_count INTEGER DEFAULT 0,
		sora2_cooldown_until DATETIME,
		total_image_count INTEGER DEFAULT 0,
		total_video_count INTEGER DEFAULT 0,
		total_error_count INTEGER DEFAULT 0,
		today_image_count INTEGER DEFAULT 0,
		today_video_count INTEGER DEFAULT 0,
		today_error_count INTEGER DEFAULT 0,
		today_date TEXT,
		consecutive_errors INTEGER DEFAULT 0,
		last_error_at DATETIME,
		expiry_time DATETIME,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		last_used_at DATETIME
	);

	CREATE TABLE IF NOT EXISTS system_config (
		id INTEGER PRIMARY KEY CHECK (id = 1),
		admin_username TEXT NOT NULL DEFAULT 'admin',
		admin_password_hash TEXT NOT NULL DEFAULT '',
		api_key TEXT NOT NULL DEFAULT 'han1234',
		proxy_enabled BOOLEAN DEFAULT 0,
		proxy_url TEXT,
		cache_enabled BOOLEAN DEFAULT 0,
		cache_timeout INTEGER DEFAULT 600,
		cache_base_url TEXT,
		image_timeout INTEGER DEFAULT 300,
		video_timeout INTEGER DEFAULT 3000,
		error_ban_threshold INTEGER DEFAULT 3,
		task_retry_enabled BOOLEAN DEFAULT 1,
		task_max_retries INTEGER DEFAULT 3,
		auto_disable_401 BOOLEAN DEFAULT 1,
		token_auto_refresh BOOLEAN DEFAULT 0,
		watermark_free_enabled BOOLEAN DEFAULT 0,
		watermark_parse_method TEXT DEFAULT 'third_party',
		watermark_parse_url TEXT,
		watermark_parse_token TEXT,
		watermark_fallback BOOLEAN DEFAULT 1,
		call_mode TEXT DEFAULT 'default',
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS tasks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		task_id TEXT NOT NULL UNIQUE,
		token_id INTEGER NOT NULL,
		model TEXT NOT NULL,
		prompt TEXT NOT NULL,
		status TEXT DEFAULT 'processing',
		progress REAL DEFAULT 0.0,
		result_urls TEXT,
		error_message TEXT,
		retry_count INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		completed_at DATETIME,
		FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS request_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		token_id INTEGER,
		task_id TEXT,
		operation TEXT NOT NULL,
		request_body TEXT,
		response_body TEXT,
		status_code INTEGER DEFAULT -1,
		duration_ms INTEGER DEFAULT -1,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME,
		FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE SET NULL
	);

	INSERT OR IGNORE INTO system_config (id) VALUES (1);
	`
	_, err := db.conn.Exec(schema)
	return err
}

func (db *DB) CreateToken(token *models.Token) (int64, error) {
	result, err := db.conn.Exec(`
		INSERT INTO tokens (token, email, name, is_active, is_expired, image_enabled, video_enabled, image_concurrency, video_concurrency, sora2_supported)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		token.Token, token.Email, token.Name, token.IsActive, token.IsExpired,
		token.ImageEnabled, token.VideoEnabled, token.ImageConcurrency, token.VideoConcurrency, token.Sora2Supported)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *DB) GetTokenByID(id int64) (*models.Token, error) {
	token := &models.Token{}
	err := db.conn.QueryRow(`
		SELECT id, token, email, COALESCE(name, ''), is_active, is_expired, image_enabled, video_enabled,
		image_concurrency, video_concurrency, sora2_supported, cooled_until,
		COALESCE(total_image_count, 0), COALESCE(total_video_count, 0), COALESCE(total_error_count, 0),
		COALESCE(today_image_count, 0), COALESCE(today_video_count, 0), COALESCE(today_error_count, 0), COALESCE(today_date, ''),
		COALESCE(consecutive_errors, 0), last_error_at, last_used_at, created_at
		FROM tokens WHERE id = ?`, id).Scan(
		&token.ID, &token.Token, &token.Email, &token.Name, &token.IsActive, &token.IsExpired,
		&token.ImageEnabled, &token.VideoEnabled, &token.ImageConcurrency, &token.VideoConcurrency,
		&token.Sora2Supported, &token.CooledUntil,
		&token.TotalImageCount, &token.TotalVideoCount, &token.TotalErrorCount,
		&token.TodayImageCount, &token.TodayVideoCount, &token.TodayErrorCount, &token.TodayDate,
		&token.ConsecutiveErrors, &token.LastErrorAt, &token.LastUsedAt, &token.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	return token, err
}

func (db *DB) GetTokenByToken(tokenStr string) (*models.Token, error) {
	token := &models.Token{}
	err := db.conn.QueryRow(`SELECT id, token, email, name, is_active, is_expired, image_enabled, video_enabled, image_concurrency, video_concurrency, sora2_supported, created_at FROM tokens WHERE token = ?`, tokenStr).Scan(
		&token.ID, &token.Token, &token.Email, &token.Name, &token.IsActive, &token.IsExpired,
		&token.ImageEnabled, &token.VideoEnabled, &token.ImageConcurrency, &token.VideoConcurrency, &token.Sora2Supported, &token.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	return token, err
}

func (db *DB) UpdateToken(token *models.Token) error {
	_, err := db.conn.Exec(`
		UPDATE tokens SET token=?, email=?, name=?, is_active=?, is_expired=?, image_enabled=?, video_enabled=?,
		image_concurrency=?, video_concurrency=?, sora2_supported=?, cooled_until=?,
		total_image_count=?, total_video_count=?, total_error_count=?,
		today_image_count=?, today_video_count=?, today_error_count=?, today_date=?,
		consecutive_errors=?, last_error_at=?, last_used_at=?
		WHERE id=?`,
		token.Token, token.Email, token.Name, token.IsActive, token.IsExpired,
		token.ImageEnabled, token.VideoEnabled, token.ImageConcurrency, token.VideoConcurrency,
		token.Sora2Supported, token.CooledUntil,
		token.TotalImageCount, token.TotalVideoCount, token.TotalErrorCount,
		token.TodayImageCount, token.TodayVideoCount, token.TodayErrorCount, token.TodayDate,
		token.ConsecutiveErrors, token.LastErrorAt, token.LastUsedAt,
		token.ID)
	return err
}

func (db *DB) DeleteToken(id int64) error {
	_, err := db.conn.Exec(`DELETE FROM tokens WHERE id = ?`, id)
	return err
}

func (db *DB) GetActiveTokens() ([]*models.Token, error) {
	rows, err := db.conn.Query(`SELECT id, token, email, name, is_active, is_expired, image_enabled, video_enabled, image_concurrency, video_concurrency, sora2_supported, created_at FROM tokens WHERE is_active = 1 AND is_expired = 0`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTokens(rows)
}

func (db *DB) GetAllTokens() ([]*models.Token, error) {
	rows, err := db.conn.Query(`SELECT id, token, email, name, is_active, is_expired, image_enabled, video_enabled, image_concurrency, video_concurrency, sora2_supported, created_at FROM tokens`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTokens(rows)
}

func scanTokens(rows *sql.Rows) ([]*models.Token, error) {
	var tokens []*models.Token
	for rows.Next() {
		token := &models.Token{}
		if err := rows.Scan(&token.ID, &token.Token, &token.Email, &token.Name, &token.IsActive, &token.IsExpired,
			&token.ImageEnabled, &token.VideoEnabled, &token.ImageConcurrency, &token.VideoConcurrency, &token.Sora2Supported, &token.CreatedAt); err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
	}
	return tokens, rows.Err()
}

func (db *DB) GetSystemConfig() (*models.SystemConfig, error) {
	cfg := &models.SystemConfig{}
	err := db.conn.QueryRow(`SELECT id, admin_username, admin_password_hash, api_key, proxy_enabled, cache_enabled, cache_timeout, image_timeout, video_timeout, error_ban_threshold, task_retry_enabled, task_max_retries, auto_disable_401, watermark_free_enabled, watermark_parse_method, watermark_fallback, call_mode, updated_at FROM system_config WHERE id = 1`).Scan(
		&cfg.ID, &cfg.AdminUsername, &cfg.AdminPasswordHash, &cfg.APIKey, &cfg.ProxyEnabled, &cfg.CacheEnabled, &cfg.CacheTimeout,
		&cfg.ImageTimeout, &cfg.VideoTimeout, &cfg.ErrorBanThreshold, &cfg.TaskRetryEnabled, &cfg.TaskMaxRetries, &cfg.AutoDisable401,
		&cfg.WatermarkFreeEnabled, &cfg.WatermarkParseMethod, &cfg.WatermarkFallback, &cfg.CallMode, &cfg.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	return cfg, err
}

func (db *DB) UpdateSystemConfig(cfg *models.SystemConfig) error {
	cfg.UpdatedAt = time.Now()
	_, err := db.conn.Exec(`
		UPDATE system_config SET admin_username=?, admin_password_hash=?, api_key=?, proxy_enabled=?, cache_enabled=?, cache_timeout=?,
		image_timeout=?, video_timeout=?, error_ban_threshold=?, task_retry_enabled=?, task_max_retries=?, auto_disable_401=?,
		watermark_free_enabled=?, watermark_parse_method=?, watermark_fallback=?, call_mode=?, updated_at=? WHERE id = 1`,
		cfg.AdminUsername, cfg.AdminPasswordHash, cfg.APIKey, cfg.ProxyEnabled, cfg.CacheEnabled, cfg.CacheTimeout,
		cfg.ImageTimeout, cfg.VideoTimeout, cfg.ErrorBanThreshold, cfg.TaskRetryEnabled, cfg.TaskMaxRetries, cfg.AutoDisable401,
		cfg.WatermarkFreeEnabled, cfg.WatermarkParseMethod, cfg.WatermarkFallback, cfg.CallMode, cfg.UpdatedAt)
	return err
}

func (db *DB) CreateTask(task *models.Task) (int64, error) {
	result, err := db.conn.Exec(`
		INSERT INTO tasks (task_id, token_id, model, prompt, status, progress)
		VALUES (?, ?, ?, ?, ?, ?)`,
		task.TaskID, task.TokenID, task.Model, task.Prompt, task.Status, task.Progress)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *DB) GetTaskByTaskID(taskID string) (*models.Task, error) {
	task := &models.Task{}
	err := db.conn.QueryRow(`SELECT id, task_id, token_id, model, prompt, status, progress, retry_count, created_at FROM tasks WHERE task_id = ?`, taskID).Scan(
		&task.ID, &task.TaskID, &task.TokenID, &task.Model, &task.Prompt, &task.Status, &task.Progress, &task.RetryCount, &task.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	return task, err
}

func (db *DB) UpdateTask(task *models.Task) error {
	_, err := db.conn.Exec(`UPDATE tasks SET status=?, progress=?, result_urls=?, error_message=?, retry_count=?, completed_at=? WHERE id=?`,
		task.Status, task.Progress, task.ResultURLs, task.ErrorMessage, task.RetryCount, task.CompletedAt, task.ID)
	return err
}

// Request Logs

func (db *DB) CreateRequestLog(log *models.RequestLog) (int64, error) {
	result, err := db.conn.Exec(`
		INSERT INTO request_logs (token_id, task_id, operation, request_body, response_body, status_code, duration_ms, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		log.TokenID, log.TaskID, log.Operation, log.RequestBody, log.ResponseBody, log.StatusCode, log.DurationMs, time.Now())
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (db *DB) GetRequestLogs(limit int) ([]*models.RequestLog, error) {
	rows, err := db.conn.Query(`
		SELECT l.id, l.token_id, l.task_id, l.operation, l.request_body, l.response_body, l.status_code, l.duration_ms, l.created_at, l.updated_at,
		       COALESCE(t.email, '') as token_email,
		       COALESCE(tk.status, '') as task_status,
		       COALESCE(tk.progress, 0) as task_progress
		FROM request_logs l
		LEFT JOIN tokens t ON l.token_id = t.id
		LEFT JOIN tasks tk ON l.task_id = tk.task_id
		ORDER BY l.created_at DESC
		LIMIT ?`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*models.RequestLog
	for rows.Next() {
		log := &models.RequestLog{}
		if err := rows.Scan(&log.ID, &log.TokenID, &log.TaskID, &log.Operation, &log.RequestBody, &log.ResponseBody,
			&log.StatusCode, &log.DurationMs, &log.CreatedAt, &log.UpdatedAt, &log.TokenEmail, &log.TaskStatus, &log.TaskProgress); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}

func (db *DB) ClearRequestLogs() error {
	_, err := db.conn.Exec(`DELETE FROM request_logs`)
	return err
}

func (db *DB) UpdateRequestLog(id int64, statusCode int, responseBody string, durationMs int64) error {
	_, err := db.conn.Exec(`UPDATE request_logs SET status_code=?, response_body=?, duration_ms=?, updated_at=? WHERE id=?`,
		statusCode, responseBody, durationMs, time.Now(), id)
	return err
}

// Batch Token Operations

func (db *DB) BatchEnableTokens(ids []int64) (int64, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	query := `UPDATE tokens SET is_active = 1, consecutive_errors = 0 WHERE id IN (`
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		if i > 0 {
			query += ","
		}
		query += "?"
		args[i] = id
	}
	query += ")"
	result, err := db.conn.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (db *DB) BatchDisableTokens(ids []int64) (int64, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	query := `UPDATE tokens SET is_active = 0 WHERE id IN (`
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		if i > 0 {
			query += ","
		}
		query += "?"
		args[i] = id
	}
	query += ")"
	result, err := db.conn.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (db *DB) BatchDeleteTokens(ids []int64) (int64, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	query := `DELETE FROM tokens WHERE id IN (`
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		if i > 0 {
			query += ","
		}
		query += "?"
		args[i] = id
	}
	query += ")"
	result, err := db.conn.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (db *DB) BatchDeleteDisabledTokens(ids []int64) (int64, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	query := `DELETE FROM tokens WHERE is_active = 0 AND id IN (`
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		if i > 0 {
			query += ","
		}
		query += "?"
		args[i] = id
	}
	query += ")"
	result, err := db.conn.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (db *DB) BatchUpdateProxy(ids []int64, proxyURL string) (int64, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	query := `UPDATE tokens SET proxy_url = ? WHERE id IN (`
	args := make([]interface{}, len(ids)+1)
	args[0] = proxyURL
	for i, id := range ids {
		if i > 0 {
			query += ","
		}
		query += "?"
		args[i+1] = id
	}
	query += ")"
	result, err := db.conn.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (db *DB) GetTokensByIDs(ids []int64) ([]*models.Token, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	query := `SELECT id, token, email, name, is_active, is_expired, image_enabled, video_enabled, image_concurrency, video_concurrency, sora2_supported, created_at FROM tokens WHERE id IN (`
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		if i > 0 {
			query += ","
		}
		query += "?"
		args[i] = id
	}
	query += ")"
	rows, err := db.conn.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTokens(rows)
}
