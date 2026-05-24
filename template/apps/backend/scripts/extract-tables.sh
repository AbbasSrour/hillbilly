#!/bin/bash

# This script extracts specific tables from a PostgreSQL dump file.
# Interactive mode allows selection of backup file, tables, and extraction type.

set -euo pipefail

# --- Default values --- #
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Determine project root
if command -v git >/dev/null 2>&1; then
  PROJECT_ROOT="$(git -C "${SCRIPT_DIR}" rev-parse --show-toplevel 2>/dev/null || true)"
fi

if [ -z "${PROJECT_ROOT:-}" ]; then
  PROJECT_ROOT="$(cd "$(dirname "$0")"/../../.. && pwd)"
fi

BACKUP_DIR="${PROJECT_ROOT}/backups"

# --- Functions --- #
usage() {
  echo "Usage: $0 [-i <input_file>] [-o <output_file>] [-t <tables>] [-m <mode>] [-n]"
  echo ""
  echo "Options:"
  echo "  -i <input_file>   Input SQL dump file"
  echo "  -o <output_file>  Output file path"
  echo "  -t <tables>       Comma-separated list of tables to extract"
  echo "  -m <mode>         Extraction mode: schema, data, or both (default: both)"
  echo "  -n                Non-interactive mode (requires -i, -t)"
  echo "  -h                Display this help message"
  echo ""
  echo "Examples:"
  echo "  $0                                    # Interactive mode"
  echo "  $0 -n -i backup.sql -t users,roles    # Non-interactive"
  exit 1
}

# Select backup file interactively
select_backup_file() {
  echo ""
  echo "Available backup files:"
  echo "------------------------"
  
  local files=()
  local i=1
  
  while IFS= read -r file; do
    files+=("$file")
    local size
    size=$(du -h "$file" | cut -f1)
    local basename
    basename=$(basename "$file")
    echo "  $i) $basename ($size)"
    ((i++))
  done < <(find "$BACKUP_DIR" -maxdepth 1 -name "*.sql" -type f | sort -r)
  
  if [ ${#files[@]} -eq 0 ]; then
    echo "  No SQL backup files found in $BACKUP_DIR"
    exit 1
  fi
  
  echo ""
  read -rp "Select backup file [1-${#files[@]}]: " selection
  
  if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#files[@]} ]; then
    echo "Invalid selection"
    exit 1
  fi
  
  INPUT_FILE="${files[$((selection-1))]}"
  echo "Selected: $(basename "$INPUT_FILE")"
}

# Discover tables in the dump file
discover_tables() {
  echo ""
  echo "Scanning for tables..."
  
  AVAILABLE_TABLES=()
  while IFS= read -r table; do
    AVAILABLE_TABLES+=("$table")
  done < <(grep -oP '(?<=CREATE TABLE public\.)[a-z_]+' "$INPUT_FILE" | sort -u)
  
  echo "Found ${#AVAILABLE_TABLES[@]} tables"
}

# Select tables interactively
select_tables() {
  echo ""
  echo "Available tables:"
  echo "-----------------"
  
  local i=1
  for table in "${AVAILABLE_TABLES[@]}"; do
    echo "  $i) $table"
    ((i++))
  done
  
  echo ""
  echo "Enter table numbers separated by commas (e.g., 1,3,5)"
  echo "Or enter 'all' to select all tables"
  read -rp "Selection: " selection
  
  SELECTED_TABLES=()
  
  if [ "$selection" = "all" ]; then
    SELECTED_TABLES=("${AVAILABLE_TABLES[@]}")
  else
    IFS=',' read -ra indices <<< "$selection"
    for idx in "${indices[@]}"; do
      idx=$(echo "$idx" | tr -d ' ')
      if [[ "$idx" =~ ^[0-9]+$ ]] && [ "$idx" -ge 1 ] && [ "$idx" -le ${#AVAILABLE_TABLES[@]} ]; then
        SELECTED_TABLES+=("${AVAILABLE_TABLES[$((idx-1))]}")
      fi
    done
  fi
  
  if [ ${#SELECTED_TABLES[@]} -eq 0 ]; then
    echo "No valid tables selected"
    exit 1
  fi
  
  echo ""
  echo "Selected tables: ${SELECTED_TABLES[*]}"
}

# Select extraction mode
select_mode() {
  echo ""
  echo "Extraction mode:"
  echo "  1) Schema only (CREATE TABLE statements)"
  echo "  2) Data only (INSERT statements)"
  echo "  3) Both schema and data"
  echo ""
  read -rp "Select mode [1-3] (default: 3): " mode_selection
  
  case "${mode_selection:-3}" in
    1) EXTRACT_MODE="schema" ;;
    2) EXTRACT_MODE="data" ;;
    3|"") EXTRACT_MODE="both" ;;
    *) EXTRACT_MODE="both" ;;
  esac
  
  echo "Mode: $EXTRACT_MODE"
}

# Set output file
set_output_file() {
  local default_name="extracted_tables_$(date +%Y%m%d_%H%M%S).sql"
  local default_path="${BACKUP_DIR}/${default_name}"
  
  echo ""
  read -rp "Output file (default: $default_name): " output_input
  
  if [ -z "$output_input" ]; then
    OUTPUT_FILE="$default_path"
  elif [[ "$output_input" = /* ]]; then
    OUTPUT_FILE="$output_input"
  else
    OUTPUT_FILE="${BACKUP_DIR}/${output_input}"
  fi
  
  echo "Output: $OUTPUT_FILE"
}

# Extract tables using streaming
extract_tables() {
  echo ""
  echo "Extracting tables..."
  
  # Build table pattern for matching
  local table_pattern=""
  for table in "${SELECTED_TABLES[@]}"; do
    if [ -n "$table_pattern" ]; then
      table_pattern+="|"
    fi
    table_pattern+="$table"
  done
  
  # Create Python extraction script inline
  python3 - "$INPUT_FILE" "$OUTPUT_FILE" "$table_pattern" "$EXTRACT_MODE" << 'PYTHON_SCRIPT'
import sys

input_file = sys.argv[1]
output_file = sys.argv[2]
table_pattern = set(sys.argv[3].split("|"))
extract_mode = sys.argv[4]

extract_schema = extract_mode in ("schema", "both")
extract_data = extract_mode in ("data", "both")

current_table = None
in_create = False
lines_written = 0

with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
    # Write header
    outfile.write("-- Extracted tables: " + ", ".join(sorted(table_pattern)) + "\n")
    outfile.write("-- Mode: " + extract_mode + "\n")
    outfile.write("-- Generated: " + __import__('datetime').datetime.now().isoformat() + "\n\n")
    lines_written += 4
    
    for line in infile:
        # Track CREATE TABLE blocks
        if line.startswith("CREATE TABLE public."):
            table = line.split("public.")[1].split()[0].rstrip("(")
            if table in table_pattern and extract_schema:
                current_table = table
                in_create = True
                outfile.write(line)
                lines_written += 1
            continue
        
        if in_create:
            outfile.write(line)
            lines_written += 1
            if line.strip() == ");":
                in_create = False
                current_table = None
                outfile.write("\n")
            continue
        
        # Track data sections
        if line.startswith("-- Data for Name:"):
            parts = line.split(";")[0]
            table = parts.split("Name:")[1].strip()
            if table in table_pattern and extract_data:
                current_table = table
                outfile.write(line)
                lines_written += 1
            else:
                current_table = None
            continue
        
        # Write COPY or INSERT data for target tables
        if current_table and extract_data:
            if line.startswith("COPY public.") or line.startswith("INSERT INTO public."):
                check_table = line.split("public.")[1].split()[0].rstrip("(")
                if check_table in table_pattern:
                    outfile.write(line)
                    lines_written += 1
            elif not line.startswith("--") and not line.startswith("\\"):
                if line.strip() == "\\.":
                    outfile.write(line)
                    outfile.write("\n")
                    lines_written += 1
                    current_table = None
                elif current_table:
                    outfile.write(line)
                    lines_written += 1

print(f"Wrote {lines_written} lines")
PYTHON_SCRIPT

  if [ -s "$OUTPUT_FILE" ]; then
    local size
    size=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo "Extraction complete!"
    echo "  File: $OUTPUT_FILE"
    echo "  Size: $size"
  else
    echo "Error: Output file is empty" >&2
    exit 1
  fi
}

# --- Main --- #
INTERACTIVE=true
INPUT_FILE=""
OUTPUT_FILE=""
TABLES_INPUT=""
EXTRACT_MODE="both"

# Parse command-line options
while getopts "i:o:t:m:nh" opt; do
  case ${opt} in
    i) INPUT_FILE=$OPTARG ;;
    o) OUTPUT_FILE=$OPTARG ;;
    t) TABLES_INPUT=$OPTARG ;;
    m) EXTRACT_MODE=$OPTARG ;;
    n) INTERACTIVE=false ;;
    h) usage ;;
    \?) usage ;;
  esac
done
shift $((OPTIND -1))

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

if [ "$INTERACTIVE" = true ]; then
  echo "================================"
  echo "  PostgreSQL Table Extractor"
  echo "================================"
  
  select_backup_file
  discover_tables
  select_tables
  select_mode
  set_output_file
  extract_tables
else
  # Non-interactive mode
  if [ -z "$INPUT_FILE" ] || [ -z "$TABLES_INPUT" ]; then
    echo "Error: Non-interactive mode requires -i and -t options" >&2
    usage
  fi
  
  if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file not found: $INPUT_FILE" >&2
    exit 1
  fi
  
  # Parse tables
  IFS=',' read -ra SELECTED_TABLES <<< "$TABLES_INPUT"
  
  # Set default output if not provided
  if [ -z "$OUTPUT_FILE" ]; then
    OUTPUT_FILE="${BACKUP_DIR}/extracted_tables_$(date +%Y%m%d_%H%M%S).sql"
  fi
  
  extract_tables
fi
