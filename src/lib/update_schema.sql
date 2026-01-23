-- SQL Migration to add new fields to restrooms table
ALTER TABLE restrooms 
ADD COLUMN IF NOT EXISTS opening_time time,
ADD COLUMN IF NOT EXISTS closing_time time,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
