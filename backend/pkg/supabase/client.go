package supabase

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
)

type Client struct {
	conn *pgx.Conn
}

var dbConn *pgx.Conn

// Init initializes the database connection
func Init() error {
	ctx := context.Background()
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL not set")
	}

	conn, err := pgx.Connect(ctx, databaseURL)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test connection
	if err := conn.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	dbConn = conn
	return nil
}

// NewClient creates a new database client
func NewClient() *Client {
	return &Client{conn: dbConn}
}

// Query executes a raw SQL query and returns JSON
func (c *Client) Query(sql string, args ...interface{}) (json.RawMessage, error) {
	ctx := context.Background()
	rows, err := c.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	// Convert rows to JSON
	var result []map[string]interface{}
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, fmt.Errorf("failed to read row: %w", err)
		}

		fieldDescriptions := rows.FieldDescriptions()
		row := make(map[string]interface{})
		for i, fd := range fieldDescriptions {
			row[string(fd.Name)] = values[i]
		}
		result = append(result, row)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	jsonData, _ := json.Marshal(result)
	return jsonData, nil
}

// Exec executes a SQL statement (INSERT, UPDATE, DELETE)
func (c *Client) Exec(sql string, args ...interface{}) error {
	ctx := context.Background()
	_, err := c.conn.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("exec error: %w", err)
	}
	return nil
}

// Select retrieves records from a table (RestAPI-style filter converted to SQL)
func (c *Client) Select(table string, filter string) (json.RawMessage, error) {
	sql := fmt.Sprintf("SELECT * FROM %s", table)

	// Simple filter parsing (user_id=eq.123 -> WHERE user_id = '123')
	if filter != "" {
		// This is a simplified version; real implementation would parse PostgREST filters
		sql += " WHERE " + filter
	}

	return c.Query(sql)
}

// Insert inserts a record and returns it
func (c *Client) Insert(table string, data map[string]interface{}) (json.RawMessage, error) {
	if len(data) == 0 {
		return json.Marshal([]interface{}{})
	}

	columns := make([]string, 0, len(data))
	values := make([]interface{}, 0, len(data))
	placeholders := make([]string, 0, len(data))

	i := 1
	for k, v := range data {
		columns = append(columns, k)
		values = append(values, v)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
		i++
	}

	columnStr := ""
	for _, col := range columns {
		if columnStr != "" {
			columnStr += ", "
		}
		columnStr += col
	}

	placeholderStr := ""
	for _, ph := range placeholders {
		if placeholderStr != "" {
			placeholderStr += ", "
		}
		placeholderStr += ph
	}

	sql := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s) RETURNING *", table, columnStr, placeholderStr)
	return c.Query(sql, values...)
}

// Upsert inserts or updates a record (assumes conflict on user_id, tmdb_id or similar)
func (c *Client) Upsert(table string, data map[string]interface{}) (json.RawMessage, error) {
	if len(data) == 0 {
		return json.Marshal([]interface{}{})
	}

	columns := make([]string, 0, len(data))
	values := make([]interface{}, 0, len(data))
	placeholders := make([]string, 0, len(data))
	updates := make([]string, 0, len(data))

	i := 1
	for k, v := range data {
		columns = append(columns, k)
		values = append(values, v)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
		updates = append(updates, fmt.Sprintf("%s = $%d", k, i))
		i++
	}

	columnStr := ""
	for _, col := range columns {
		if columnStr != "" {
			columnStr += ", "
		}
		columnStr += col
	}

	placeholderStr := ""
	for _, ph := range placeholders {
		if placeholderStr != "" {
			placeholderStr += ", "
		}
		placeholderStr += ph
	}

	updateStr := ""
	for _, upd := range updates {
		if updateStr != "" {
			updateStr += ", "
		}
		updateStr += upd
	}

	// Assumes unique constraint on (user_id, tmdb_id) or similar
	sql := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s) ON CONFLICT (user_id, tmdb_id) DO UPDATE SET %s RETURNING *",
		table, columnStr, placeholderStr, updateStr,
	)
	return c.Query(sql, values...)
}

// Update updates records matching a condition
func (c *Client) Update(table string, data map[string]interface{}, where string) (json.RawMessage, error) {
	if len(data) == 0 {
		return json.Marshal([]interface{}{})
	}

	updates := make([]string, 0, len(data))
	values := make([]interface{}, 0, len(data))

	i := 1
	for k, v := range data {
		updates = append(updates, fmt.Sprintf("%s = $%d", k, i))
		values = append(values, v)
		i++
	}

	updateStr := ""
	for _, upd := range updates {
		if updateStr != "" {
			updateStr += ", "
		}
		updateStr += upd
	}

	sql := fmt.Sprintf("UPDATE %s SET %s", table, updateStr)
	if where != "" {
		sql += " WHERE " + where
	}
	sql += " RETURNING *"

	return c.Query(sql, values...)
}

// Delete deletes records matching a condition
func (c *Client) Delete(table string, where string) (json.RawMessage, error) {
	sql := fmt.Sprintf("DELETE FROM %s", table)
	if where != "" {
		sql += " WHERE " + where
	}

	err := c.Exec(sql)
	if err != nil {
		return nil, err
	}

	return json.Marshal(map[string]bool{"success": true})
}

// Close closes the database connection
func Close() error {
	if dbConn != nil {
		return dbConn.Close(context.Background())
	}
	return nil
}
