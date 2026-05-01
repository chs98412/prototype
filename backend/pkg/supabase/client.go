package supabase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type Client struct {
	url    string
	apiKey string
	client *http.Client
}

// NewClient creates a new Supabase client
func NewClient() *Client {
	return &Client{
		url:    os.Getenv("SUPABASE_URL"),
		apiKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		client: http.DefaultClient,
	}
}

// makeRequest는 공통 HTTP 요청 헬퍼
func (c *Client) makeRequest(method, path string, body []byte) ([]byte, int, error) {
	url := c.url + path
	req, err := http.NewRequest(method, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %w", err)
	}

	// 공통 헤더 설정
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, fmt.Errorf("failed to read response: %w", err)
	}

	return respBody, resp.StatusCode, nil
}

// RPC calls a Supabase RPC function
func (c *Client) RPC(name string, params map[string]interface{}) (json.RawMessage, error) {
	body, _ := json.Marshal(params)
	respBody, statusCode, err := c.makeRequest("POST", "/rest/v1/rpc/"+name, body)
	if err != nil {
		return nil, err
	}

	if statusCode != http.StatusOK && statusCode != http.StatusCreated {
		return nil, fmt.Errorf("rpc error (status %d): %s", statusCode, string(respBody))
	}

	return respBody, nil
}

// Select retrieves records from a table
// query example: "user_id=eq.123&order=created_at.desc&limit=10"
func (c *Client) Select(table string, query string) (json.RawMessage, error) {
	path := "/rest/v1/" + table
	if query != "" {
		path += "?" + query
	}

	respBody, statusCode, err := c.makeRequest("GET", path, []byte{})
	if err != nil {
		return nil, err
	}

	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("select error (status %d): %s", statusCode, string(respBody))
	}

	return respBody, nil
}

// Insert inserts a record
func (c *Client) Insert(table string, data map[string]interface{}) (json.RawMessage, error) {
	body, _ := json.Marshal(data)
	respBody, statusCode, err := c.makeRequest("POST", "/rest/v1/"+table, body)
	if err != nil {
		return nil, err
	}

	if statusCode != http.StatusCreated {
		return nil, fmt.Errorf("insert error (status %d): %s", statusCode, string(respBody))
	}

	return respBody, nil
}

// Upsert inserts or updates a record
func (c *Client) Upsert(table string, data map[string]interface{}) (json.RawMessage, error) {
	body, _ := json.Marshal(data)
	req, _ := http.NewRequest("POST", c.url+"/rest/v1/"+table, bytes.NewBuffer(body))
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "resolution=merge-duplicates")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("upsert request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("upsert error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

// Update updates records matching a condition
func (c *Client) Update(table string, data map[string]interface{}, where string) (json.RawMessage, error) {
	body, _ := json.Marshal(data)
	path := "/rest/v1/" + table
	if where != "" {
		path += "?" + where
	}

	respBody, statusCode, err := c.makeRequest("PATCH", path, body)
	if err != nil {
		return nil, err
	}

	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("update error (status %d): %s", statusCode, string(respBody))
	}

	return respBody, nil
}

// Delete deletes records matching a condition
func (c *Client) Delete(table string, where string) (json.RawMessage, error) {
	path := "/rest/v1/" + table
	if where != "" {
		path += "?" + where
	}

	respBody, statusCode, err := c.makeRequest("DELETE", path, []byte{})
	if err != nil {
		return nil, err
	}

	if statusCode != http.StatusOK && statusCode != http.StatusNoContent {
		return nil, fmt.Errorf("delete error (status %d): %s", statusCode, string(respBody))
	}

	return respBody, nil
}
