package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(dsn string) error {
	var err error

	slowQueryThreshold := 100 * time.Millisecond
	logLevel := gormlogger.Warn // always log slow queries and errors
	if os.Getenv("DEBUG") != "" {
		logLevel = gormlogger.Info // log all queries in debug mode
	}

	dbLogger := gormlogger.New(
		log.New(os.Stdout, "[DB] ", log.LstdFlags),
		gormlogger.Config{
			SlowThreshold:             slowQueryThreshold,
			LogLevel:                  logLevel,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: dbLogger,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}
	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	log.Println("Database connected successfully")
	return nil
}

func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func NewClient() *gorm.DB {
	return DB
}
