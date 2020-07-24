package main

import (
	"github.com/kris-nova/logger"
)

func init() {
	// Control colored output
	logger.Color = true
	logger.Fabulous = true
	// Add timestamps
	logger.Timestamps = false
	logger.Level = 4
}

func main() {

	if err := NewRootCmd().Execute(); err != nil {
		logger.Warning("%s\n", err)
	}
}
