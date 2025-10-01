# SwapTZ

A modern, lightweight timestamp converter. Convert Unix timestamps to human-readable dates and times in any timezone with multiple display modes.

## Features

- 🕐 Convert Unix timestamps to human-readable format
- 🌍 Support for all timezones with grouped common timezones
- 📱 Responsive design that works on all devices
- ⚡ Fast client-side rendering for instant conversions
- 🎨 Multiple display modes (default, date, compact, ISO, relative)
- 🔄 Real-time timezone switching without page reloads

## Display Modes

- **Default**: `Sun 18 May 2025 at 10:30AM`
- **Date**: `18 May 2025`
- **Compact**: `18/05/2025 10:30`
- **ISO**: `2025-05-18T10:30:00+10:00`
- **Relative**: `in 2 days`

## Usage

### URL Structure

```
/                    # Landing page with usage instructions
/{timestamp}         # Convert specific timestamp
/{timestamp}?mode={mode}  # Convert with specific display mode
```

### Examples

```
/1747510600                    # Default format
/1747510600?mode=date          # Date only
/1747510600?mode=compact       # Compact format
/1747510600?mode=iso           # ISO 8601 format
/1747510600?mode=relative      # Relative time
```

## Valid Timestamps

- Positive integers only
- Between 1970 and 2100
- Examples: `1747510600`, `1609459200`, `2147483647`

## License

MIT License - see LICENSE file for details.
