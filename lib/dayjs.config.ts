// lib/dayjs.config.ts
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Set default timezone (replace with your desired timezone)
dayjs.tz.setDefault('Asia/Kolkata') // Example: India time

// Optional: Export configured dayjs instance
export const configuredDayjs = dayjs