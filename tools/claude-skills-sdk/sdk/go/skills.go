// Package skills loads bundled Claude skill prompts.
package skills

import (
	"embed"
	"encoding/json"
	"errors"
	"strings"
)

//go:embed all:_skills
var bundle embed.FS

type Skill struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	File     string   `json:"file"`
	Category string   `json:"category"`
	Tags     []string `json:"tags"`
	Overlay  bool     `json:"overlay"`
	Prompt   string   `json:"-"`
}

type index struct {
	Version string  `json:"version"`
	Skills  []Skill `json:"skills"`
}

func loadIndex() (*index, error) {
	raw, err := bundle.ReadFile("_skills/index.json")
	if err != nil {
		return nil, err
	}
	var idx index
	if err := json.Unmarshal(raw, &idx); err != nil {
		return nil, err
	}
	return &idx, nil
}

// List returns all bundled skill ids.
func List() ([]string, error) {
	idx, err := loadIndex()
	if err != nil {
		return nil, err
	}
	ids := make([]string, len(idx.Skills))
	for i, s := range idx.Skills {
		ids[i] = s.ID
	}
	return ids, nil
}

// Get returns a single skill with its prompt populated.
func Get(id string) (*Skill, error) {
	idx, err := loadIndex()
	if err != nil {
		return nil, err
	}
	for _, s := range idx.Skills {
		if s.ID == id {
			raw, err := bundle.ReadFile("_skills/" + s.File)
			if err != nil {
				return nil, err
			}
			s.Prompt = string(raw)
			return &s, nil
		}
	}
	return nil, errors.New("skill not found: " + id)
}

// Compose concatenates skill prompts as a system message.
func Compose(ids []string, sep string) (string, error) {
	if sep == "" {
		sep = "\n\n---\n\n"
	}
	parts := make([]string, 0, len(ids))
	for _, id := range ids {
		s, err := Get(id)
		if err != nil {
			return "", err
		}
		parts = append(parts, s.Prompt)
	}
	return strings.Join(parts, sep), nil
}
