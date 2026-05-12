package supabase

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
)

type Client struct {
	conn *pgx.Conn
}

var dbConn *pgx.Conn

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

	if err := conn.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	dbConn = conn
	return nil
}

func NewClient() *Client {
	return &Client{conn: dbConn}
}

func (c *Client) Query(sql string, args ...interface{}) (json.RawMessage, error) {
	ctx := context.Background()
	rows, err := c.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

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

func (c *Client) Exec(sql string, args ...interface{}) error {
	ctx := context.Background()
	_, err := c.conn.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("exec error: %w", err)
	}
	return nil
}

func (c *Client) Select(table string, filter string) (json.RawMessage, error) {
	sql := fmt.Sprintf("SELECT * FROM %s", table)
	if filter != "" {
		sql += " WHERE " + filter
	}
	return c.Query(sql)
}

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

	sql := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s) RETURNING *",
		table,
		strings.Join(columns, ", "),
		strings.Join(placeholders, ", "),
	)
	return c.Query(sql, values...)
}

func (c *Client) Upsert(table string, data map[string]interface{}, conflictColumns ...string) (json.RawMessage, error) {
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

	conflict := "user_id, tmdb_id"
	if len(conflictColumns) > 0 {
		conflict = strings.Join(conflictColumns, ", ")
	}

	sql := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s) ON CONFLICT (%s) DO UPDATE SET %s RETURNING *",
		table,
		strings.Join(columns, ", "),
		strings.Join(placeholders, ", "),
		conflict,
		strings.Join(updates, ", "),
	)
	return c.Query(sql, values...)
}

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

	sql := fmt.Sprintf("UPDATE %s SET %s", table, strings.Join(updates, ", "))
	if where != "" {
		sql += " WHERE " + where
	}
	sql += " RETURNING *"

	return c.Query(sql, values...)
}

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

func Close() error {
	if dbConn != nil {
		return dbConn.Close(context.Background())
	}
	return nil
}
